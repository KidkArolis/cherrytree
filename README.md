# <img src="https://cloud.githubusercontent.com/assets/324440/11302251/2c573b4a-8f94-11e5-9df6-889b19c2ad48.png" width="320" />

Cherrytree is a flexible router that works with any framework. It translates URL changes to transitions and applies your middleware.

## Installation

The size excluding all deps is ~4.83kB gzipped and the standalone build with all deps is ~7.24kB gzipped.

    $ npm install --save cherrytree

In a CJS environment

    require('cherrytree')

In an AMD environment, require the standalone UMD build - this version has all of the dependencies bundled

    require('cherrytree/standalone')


## Docs

* [Intro Guide](docs/intro.md)
* [API Docs](docs/api.md)
* [Changelog](CHANGELOG.md)


## Demo

See it in action in [this demo](http://kidkarolis.github.io/cherrytree-redux-react-example).


## Plugins

To use `cherrytree` with React, check out [`cherrytree-for-react`](https://github.com/KidkArolis/cherrytree-for-react).


## Usage

Here's a simple way to render React apps using React.

```js
const cherrytree = require('cherrytree')
const React = require('react')
const ReactDOM = require('react-dom')
const components = require('./components')

// declare the routes
const routes = [
  { name: 'application', path: '/', abstract: true, children: [{
    { name: 'feed', path: '' },
    { name: 'messages' },
    { name: 'status', path: ':user/status/:id' },
    { name: 'profile', path: ':user', children: [{
      { name: 'lists' },
      { name: 'editProfile', path: 'edit' }
    }]}
  }]}
]

function render (transition) {
  // transition.routes for something like /KidkArolis/edit
  // would be [
  //   { name: 'application' ... },
  //   { name: 'profile' ... },
  //   { name: 'editProfile' ...}
  // ]
  // We start with the inner most using reduceRight, and nest
  // each component into each other and render out to the DOM
  const App = transition.routes.reduceRight((children, route) => {
    // get the component by route name
    // you could also attach them to route config or
    // get them any other way 
    const { component } = components[route.name]
    return component
      ? React.createElement(component, { params: transition.params, children })
      : children
  }, null)
  ReactDOM.render(App, document.getElementById('root'))
}

// create the router
const router = cherrytree({ routes }, render)
// start listening to URL changes
router.start()
```

You can then extend this approach in various ways:

* add a middleware to load components/pages asynchronously
* add a middleware to track page changes for analytics
* dispatch events to a Redux store instead of rendering inline
* pass the router via context to be able to generate links or transition programmatically
* add a middleware that translates the route changes into a stream
* use middleware perform data fetching between page renders

## Examples

You can clone this repo if you want to run the `examples` locally:

* [hello-world-react](examples/hello-world-react) - best for first introduction
* [hello-world-jquery](examples/hello-world-jquery) - a single file example
* [cherry-pick](examples/cherry-pick) - a mini GitHub clone written in React.js
* [vanilla-blog](examples/vanilla-blog) - a small static demo of blog like app that uses no framework
* [server-side-react](examples/server-side-react) - a server side express app using cherrytree for routing and react for rendering

A more complex example in it's own repo:

* [cherrytree-redux-react-example](https://github.com/KidkArolis/cherrytree-redux-react-example) - a more modern stack - redux + react + react-hot-loader + cherrytree-for-react


## Features

* can be used with any view and data framework
* nested routes are great for nested UIs
* generate links in a systematic way, e.g. `router.generate('commit', {sha: '1e2760'})`
* use pushState with automatic hashchange fallback
* all urls are generated with or without `#` as appropriate
* link clicks on the page are intercepted automatically when using pushState
* dynamically load parts of your app during transitions
* dynamic segments, optional params and query params
* support for custom query string parser
* transition is a first class citizen - abort, pause, resume, retry. E.g. pause the transition to display "There are unsaved changes" message if the user clicked some link on the page or used browser's back/forward buttons
* navigate around the app programatically, e.g. `router.transitionTo('commits')`
* easily rename URL segments in a single place (e.g. /account -> /profile)


## How does it compare to other routers?

* **Backbone router** is nice and simple and can often be enough. In fact cherrytree uses some bits from Backbone router under the hood. Cherrytree adds nested routing, support for asynchronous transitions, more flexible dynamic params, url generation, automatic click handling for pushState.
* **Ember router / router.js** is the inspiration for cherrytree. It's where cherrytree inherits the idea of declaring hierarchical nested route maps. The scope of cherrytree is slightly different than that of router.js, for example cherrytree doesn't have the concept of handler objects or model hooks. On the other hand, unlike router.js - cherrytree handles browser url changes and intercepts link clicks with pushState out of the box. The handler concept and model hooks can be implemented based on the specific application needs using the middleware mechanism. Overall, cherrytree is less prescriptive, more flexible and easier to use out of the box.
* **react-router** is also inspired by router.js. React-router is trying to solve a lot of routing related aspects out of the box in the most React idiomatic way whereas with `cherrytree` you'll have to write the glue code for integrating into React yourself (see [`cherrytree-for-react` plugin](https://github.com/KidkArolis/cherrytree-for-react)). However, what you get instead is a smaller, simpler and hopefully more flexible library which should be more adaptable to your specific needs. This also means that you can use a `react-router` like approach with other `React` inspired libraries such as `mercury`, `riot`, `om`, `cycle`, `deku` and so on.


## CI

[![Build Status](https://travis-ci.org/QubitProducts/cherrytree.svg?branch=master)](https://travis-ci.org/QubitProducts/cherrytree)
[![build status](https://www.codeship.io/projects/aa5e37b0-aeb1-0131-dd5f-06fd12e6a611/status?branch=master)](https://codeship.com/projects/19734)


## Browser Support

[![Sauce Test Status](https://saucelabs.com/browser-matrix/cherrytree.svg)](https://saucelabs.com/u/cherrytree)

Cherrytree works in all modern browsers. It requires es5 environment and es6 promises. Use polyfills for those if you have to support older browsers, e.g.:

* https://github.com/es-shims/es5-shim
* https://github.com/jakearchibald/es6-promise

## Acknowledgement

Thanks to Marko Stupić for giving Cherrytree a logo from his http://icon-a-day.com/ project!

## FAQ

* Why is `cherrytree` written as one word? You got me, I'd say that represents the [wabisabi](https://en.wikipedia.org/wiki/Wabi-sabi) nature of the library.

## Want to work on this for your day job?

This project was created by the Engineering team at [Qubit](http://www.qubit.com). As we use open source libraries, we make our projects public where possible.

We’re currently looking to grow our team, so if you’re a JavaScript engineer and keen on ES2016 React+Redux applications and Node micro services, why not get in touch? Work with like minded engineers in an environment that has fantastic perks, including an annual ski trip, yoga, a competitive foosball league, and copious amounts of yogurt.

Find more details on our [Engineering site](https://eng.qubit.com). Don’t have an up to date CV? Just link us your Github profile! Better yet, send us a pull request that improves this project.
