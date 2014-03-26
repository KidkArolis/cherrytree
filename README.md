# Cherrytree

![build status](https://www.codeship.io/projects/bb769230-5ec0-0131-1b78-16ee4fa09096/status)

Cherrytree is a hierarchical router for clientside web applications. It allows modelling your application as a tree of routes where a number of routes is active at any given time. A URL is deserialized into a set of routes  and each route gets a chance of performing a bit of work like loading in data and rendering some views. Sharing parent routes between the different pages of your application means you can share model instances or compose your page (nav, sidebar, content area, etc.) bit by bit in different routes and avoid having to rerender everything on each transition. It's heavily inspired by Ember.js router and is built on top of [tildeio/router.js](https://github.com/tildeio/router.js) - a library extracted from Ember. Cherrytree, however, does not depend on Ember or any other framework and so can be used with other libraries such as Backbone or React.js.

With cherrytree - routes become the central part of how you compose the application - routes are where you create models, views and manage their lifecycle.

# Motivation

The main idea is to describe all the different parts of your application in a route map. Those could be the different pages if you have multiple pages in your app, or different states of your UI, some panel expanded, or lightbox displayed - anything that you want to have a URL for. URLs are very important for web apps - reloading the page should display the UI in the same state as it was before, people should be able to share urls, etc.(link to URL talk by tomdale).

```js
router.map(function () {
  this.resource("organisation")
  this.resource("user");
  this.resource("repository", {path: "/:owner/:repository"}, function () {
    this.resource("commits", function () {
      this.route("index");
      this.route("commit", {path: "/:sha"})
    });
    this.resource("settings", function () {
      this.route("teams");
      this.route("integrations");
    });
  });
  this.resource("account", function () {
    this.route("sshKeys");
    this.route("notifications");
    this.route("billing");
  });
});
```

In Cherrytree, being in a certain state of your app means that several Routes are active. For example, if you're at `app.com/KidkArolis/cherrytree/commits` - the list of active routes would look like `['application', 'repository', 'commits', 'commits.index']`. You can define behaviour of each route by extending `cherrytree/route`. Application route could render the outer shell of the application, e.g. the nav and container for child routes, it could also initialize some base models, e.g. user model. The repository route would load in the repository model from the server based on the URL params, the `commits.index` would load the specific commit model and render that on the screen.

# Benefits of using Cherrytree

* switching between using pushState or hashState is trivial - all urls in your app are generated the right way depending on which mode you're in
* generating links everywhere in your application is easy and systematic, e.g. `router.generate("commit.index", "1e2760")`
* decoupled route ids from URL paths means renaming URL segments is easy (e.g. if you want `account` to be called `profile`)
* easy to load parts of your app on demand
* a missing peace in your MVC architecture - a place where model and view lifecycle is managed - e.g. destroy and cleanup views when navigating between different parts of the application 
* support for query params
* flexible error handling and displaying of loading screens
* transition is a first class citizen - abort, pause, resume, retry failed ones. E.g. display pause the transition to display "You have unsaved changes" message no matter if the user clicked another link on the page, or used browser back/forward buttons
* it's not coupled to URLs - e.g. use multiple routers to manage substates of your application
* it's possible to navigate around your app programatically - URL management is just an optional sideeffect
* swappable URL management libraries - use none if you don’t need to touch the URL
* built on top of `router.js`, `route-recognizer` and `rsvp` from Ember

# Installation

Cherrytree supports both AMD and CJS. It's on `bower` and on `npm`. If you're using bower - you'll need to figure out how to setup all of the paths to cherrytree and it's dependencies. With npm - just require away.

# Docs

This covers the basic usage and the API of Cherrytree. For introduction to more concepts check out the [Ember.js Routing Guide](http://emberjs.com/guides/routing/) - the API there is slightly different, but a lot of concepts are similar.

## Basic Example

```js
var Router = require("cherrytree");
var Route = require("cherrytree/route");
var HistoryLocation = require("cherrytree/locations/history");

// for router to keep the app's state in sync with the url
// we need to use a custom location, the default `none` location
// doesn't touch the URL. This allows you implementing your own
// URL manager say if you want to save some space, or you already
// use a framework that can manage URLs like Backbone.
// The default HistoryLocation is a powerful url manager based on
// backbone's router - it supports pushState, hashState and
// can automatically fallback to hashState for browsers that don't
// support pushState

// create the router
var router = new Router({
  location: new HistoryLocation({
    pushState: false
  })
});

// your route map
router.map(function () {
  this.resource("post", {path: "/:postId"}, function () {
    this.route("show");
    this.route("edit")
  });
});

// your routes
// application route is always the root route
router.addRoute("application", Route.extend({
  activate: function () {
    this.view = $("<h1>My Blog</h1><div class='outlet'></div>");
    $(document.body).html(this.view);
  }
}));
// let's load in the model
router.addRoute("post", Route.extend({
  model: function (params) {
    this.post = new Post({
      id: params.postId
    });
    return this.post.fetch();
  }
}));
// and display it
router.addRoute("post.show", Route.extend({
  activate: function () {
    this.view = $("<p>" + this.get("post").get("content") + "</p>");
    this.parent.view.$(".outlet").html(this.view);
  },
  deactivate: function () {
    this.view.remove();
  }
}));

// let's do this!
router.startRouting();

// programatically navigate to the `posts.show` page.
router.transitionTo('posts.show', 42);
```

Go to the `cherrytree-reactjs-demo` for a more realistic example.


## Router

### var router = new Router(options)

Create a router.

* options.location - default is NoneLocation. Use HistoryLocation if you want router to hook into the URL (see example above)
* options.logging - default is false.
* options.BaseRoute - default is `cherrytree/route`. Change this to specify a different default route class that will be used for all routes that don't have a specific class configured.
* onURLChanged - e.g. function (url) {}
* onDidTransition: function (path) {}

### router.map(fn)

Configure the router with a route map. Example

```js
router.map(function () {
  this.route("about");
  this.resource("post", {path: "/:postId"}, function () {
    this.route("show", {queryParams: ['commentId']);
    this.route("edit"});
  });
})
```

### router.addRoute(name, obj)

Each route in your route map can have specific behaviour, such as loading data and specifying how to render the views. Each resource in the map can have an associated route class, the name of the resource what you use to attach the route class to it, e.g. `post`. Each route in the map has a name that can be created by combining the name of the resource and the route, e.g. `post.show`. Top level route names don't include a prefix, e.g. `about`. There are a couple of special routes that are always available - `application` and `loading`.

```js
var Route = require('cherrytree/route');
router.addRoute('post.show', Route.extend({
  model: function () {
    return $.getJSON('/url');
  },
  activate: function (data) {
    // render data
  }
}));
```

### router.addRoutes(obj)

Register multiple route classes at once, example:

```js
router.addRoutes({
  'posts.show': require('./routes/posts_show_route'),
  'posts.edit': require('./routes/posts_edit_route')
})
```

### router.startRouting()

After the router has been configured with a route map and route classes - start listening to URL changes and transition to the appropriate route based on the current URL.

### router.transitionTo(name, ...params)

Transition to a route, e.g.

```js
router.transitionTo('about');
router.transitionTo('posts.show', 1);
router.transitionTo('posts.show', 2, {queryParams: {commentId: 2}});
router.transitionTo('posts.show', 2, {queryParams: {commentId: null}});
```

### router.replaceWith(name, ...params)

Same as transitionTo, but don't add an entry in browser's history, instead replace the current entry. Useful if you don't want this transition to be accessible via browser's Back button, e.g. if you're redirecting, or if you're navigating upon clicking tabs in the UI, etc.


### router.activeRoutes()

List currently active route instances. Recommended to only use this for debugging.
Pass in the name of a route to return only the instance of that route.

### router.activeRouteNames()

List currently active route names. Recommended to only use this for debugging.

## Route

The Route class should be extend to create specific routes.

```js
var route = Route.extend({...})
```

## Route hooks

These are all of the hooks that you can implement in the routes.

### initialize(options)

Will be called upon constructing the route - only once per application lifetime. The passed in options will contain the `router` instance and the `name` of the route. Options are also set at `route.options`.

### beforeModel(transition)

Useful for route entry validations and redirects if we don't want to proceed. Return a promise to block the loading of further route model hooks.

### model(params, transition)

Useful for loading in data. Query params can be found at `params.queryParams`. Return a promise to block the loading of further route model hooks.

### afterModel(context, transition)

The first param is resolved promise value returned in the model hook.

### activate(context, transition)

The first param is resolved promise value returned in the model hook. This is called on each route starting at the root after all model hooks have been resolved. If during a transition the route is already active and the params/context hasn't changed - activate won't be called for those routes. This is where you should render your views (if any)

### deactivate()

If the route is not needed anymore it will be deactivated. This is where you should cleanup your views.

### update(context, transition)

If the route is already active, but the context of the route or some parent route has changed, the update will be called first to check if the route wants to handle this update without having to `deactivate` and `activate` again. Return `false` in this hook to indicate that the change in context has been handled and the the route shouldn't be "reactivated" with via `deactivate` and `activate` hooks. By default this hook doesn't return anything which means the routes are usually "reactivated".

### error(err)

Called when transitioning fails. This is an event that bubbles up to the root starting at the route that caused the error while transitioning meaning it's called on each route. Return false to stop propagation.

### willTransition(transition)

Called when router is about to transition. You can abort the transition using `transition.abort()`, e.g.

```js
willTransition: function (transition) {
  transition.abort();
  this.t = transition;
  if (confirm("You have unsaved changed")) {
    this.t.retry();
  }
}
```

This is also an event that bubbles up to the root starting at the child route - return false to stop propagation.

### events.queryParamsDidChange

Called when a transition happens and the only thing that changed is the query params.

## Route Methods

These are all of the methods that you can call on your route (e.g. from within the route hooks)

### route.get(field)

Get a field from the context of any of the parent routes (including this route). For example, if you fetched the `post` model in the `post` resource and returned it in the model hook as `{post: model}` you can retrieve in in all child routes via `this.get('post')`. In addition to looking at the context objects (objects returned in the model hook), `get` also looks at the members of each route, so if you've assigned something to the route instance, e.g. `this.postId = params.postId`, you can retrieve that in all child routes using get as well with `this.get('postId')`.

Example

```js
var PostRoute = Route.extend({
  model: function (params) {
    this.postId = params.postId;
    var post = new Post();
    return post.fetch().then(function () {
      // this will become the context of the route
      // e.g. this is what's passed into the `activate` hook
      return {
        post: post
      };
    });
  }
})

var PostShowRoute = Route.extend({
  activate: function () {
    this.test = 1;
    var view = new PostShowView({
      model: this.get('post'), // grabbed from the parent context
      example: this.get('postId') // grabbed from the parent route instance
      test: this.get('test') // grabbed from this route's instance
    });
    this.parent.view.$('.outlet').html(view.render().el);
  }
});
```

### route.refresh()

Reenter all the routes starting at this route.

### route.transitionTo()

An alias to `this.router.transitionTo`.

### replaceWith

An alias to `this.router.replaceWith`.



## HistoryLocation

Cherrytree can be configured to use differet implementations of libraries that manage browser's URL/history. By default, Cherrytree will use `location/none_location` which means browser's URL/history won't be managed at all, and navigating around the application will only be possible programatically. However, Cherrytree also ships with a very versatile `location/history_location` which uses `location-bar` module to enable `pushState` or `hashChange` based URL management with graceful fallback of `pushState` -> `hashChange` -> `polling` depending on browser's capabilities. What his means is that out of the box cherrytree can hook into browser's URL for managing your application's state. Here's an example of how to use this functionality:

```js
  var Router = require("cherrytree");
  var HistoryLocation = require("cherrytree/location/history_location");

  var router = new Router({
    location: new HistoryLocation({
      pushState: true
    })
  });
```

As you can see you can also provide your own implementation of location. For example, if you're already using `Backbone`, you might wanna use `Backbone.History` to manage the `hashChange` events and you could easily hook that into Cherrytree.

### var location = new HistoryLocation(options)

Create an instance of history location. Note that only one instance of HistoryLocation should be created per page since it's managing the browser's URL.

* options.pushState - default is true. Whether to use pushState, set false for hashState.
* options.root - default is `/`. Use this if your application is not being served from the root url /.
* options.interceptLinks - default is true. When pushState is used - intercepts all link clicks when appropriate, prevents the default behaviour and instead uses pushState to update the URL and handle the transition via the router. Appropriate link clicks are links that are clicked with the left mouse button with no cmd or shift key. External links, `javascript:` links, links with a `data-bypass` attribute and links starting with `#` are not intercepted.

# Changelog

## 0.2.0

* A major rewrite. Simplify code, route lifecycle, API and many other things. Route instances are now singletons that say around for the lifetime of the application. This rewrite fixes many issues such as redirecting midst transition and transitions between similar states with different params at the parent routes.
* Upgrade to the latest versions of `router.js`, `route-recognizer` and `rsvp`.
* queryParam changes - queryParams are now passed via `params.queryParams`. Transitions that only change queryParams fire a `queryParamsDidChange` event.
* `interceptLinks` feature for a seamless pushState experience - previously this had to be implemented externally.
* documentation!

## 0.1.3.

* Fix double `router.urlChanged` calls, only called once per transition now

## 0.1.2

* Fix query param support by updating to `location-bar@2.0.0-beta.1`.