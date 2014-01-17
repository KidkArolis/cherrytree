define(function (require) {

  // getHandler function, given a route name returns a handler object -
  // an instance of a route.

  var _ = require("underscore");
  var createRoute = require("./create_route");

  return function getHandler(router) {
    var seen = {};
    var stateClasses = router.stateClasses;
    var prepares = router.prepares;
    var preparesCalled = {};

    return function (name) {
      // special loading handler case
      if (name === "loading" && !stateClasses["loading"]) {
        seen[name] = {};
      }

      // look up previously generated handler functions
      if (seen[name]) { return seen[name]; }

      var state;

      function destroyState(state) {
        // console.log("cherry:", state.name, ":", "destroying", (state || {}).id);
        state.destroy();
        state._destroyed = true;

        // check if we're in the right closure
        // TODO: the closure stuff seems quite tricky here
        // not clear what's happening in different situations, perhaps it's better
        // to store all these infos on an object instead of in a closure
        if (state.name === name) {
          state = null;
        }
      }

      var handler = {

        beforeModel: function () {
          
          // clean up in case we didn't have a chance to cleanup before
          // that happens when we transition while transitioning, which means
          // we abandon some states and even though we've destroyed them, we
          // were in the wrong closure to clean up the closure variables...
          if (state && state._destroyed) {
            state = null;
          }
        },
        model: function (params, queryParams, transition) {
          // console.log("cherry:", name, ":", "model", (state || {}).id);

          if (transition === undefined) {
            transition = queryParams;
            queryParams = false;
          }

          // normalize params
          if (_.isEmpty(params)) {
            params = false;
          }
          if (_.isEmpty(queryParams)) {
            queryParams = false;
          }

          this.params = _.clone(params);

          // if the params changed - call an optional update
          // method on the state - return value false,
          // prevents the desctruction of the state and proceeds
          // with the transition. Otherwise we will destroy this
          // state and recreate it
          if ((params || queryParams) && state && state.update) {
            if (state.update(params, queryParams) === false) {
              return state;
            }
          }


          function createState(State) {
            // console.log("cherry:", name, ":", "createState", (state || {}).id, "with params", params);
            if (state) {
              if (!state._setup) {
                destroyState(state);
              }
            }

            state = new State(name, _.extend(params || {}, {
              router: router,
              queryParams: queryParams || {}
            }));

            // need to set parent here..?
            if (transition) {
              var parentState = transition.data.parentState;
              if (!parentState) {
                var leafState = _.find(transition.resolvedModels, function (leafState) {
                  // it's a leafState only if every other state is not pointing to it
                  return _.every(transition.resolvedModels, function (state) {
                    return state.parent !== leafState;
                  });
                });
                parentState = leafState;
              }
              state.setParent(parentState);
              transition.data.parentState = state;
            }
            var modelPromise = state.model();

            var whenModelResolved = function () {
              if (state.shouldActivate) {
                // destroy everything in the currentHandlerInfos down to the
                // match point. then we can
                // TODO: what if the transition is later aborted, I guess
                // we're fucked? but aborting would usually mean a failur
                // which you want to handle, not just stop transitioning...
                // aborting otherwise should be done before the deserialzie
                // is even called
                state.activate();
                state._activated = true;
              }
              return state;
            };
            if (modelPromise && modelPromise.then) {
              return RSVP.resolve(modelPromise).then(whenModelResolved);
            } else {
              whenModelResolved();
              return state;
            }
          }


          var State;
          // if we don't have a prepare method for this state
          // or if it's already been called - proceed with creating
          // the state
          if (!prepares[name] || preparesCalled[name]) {
            State = stateClasses[name] || router.BaseRoute || BaseRoute;
            if (State) {
              return createState(State);
            }
          } else {
            var promise = new RSVP.Promise(function (resolve) {
              // TODO routing: once a prepare has been called, we should remember
              // that and not call it again in the future
              prepares[name](router, function () {
                // record that this prepare has been called - we only
                // do this per the lifetime of the application as it's
                // mostly intended for loading extra code
                preparesCalled[name] = true;

                // now that we gave the prepare method a chance to preload the states
                State = stateClasses[name] || router.BaseRoute || BaseRoute;
                resolve(createState(State));
              });
            });
            return promise;
          }
        }
      };

      seen[name] = handler;

      return handler;
    };
  };
});