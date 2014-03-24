(function (define) { 'use strict';
  define(function (require) {

    var _ = require('../lib/util');
    var LocationBar = require('location-bar');

    var HistoryLocation = function (options) {
      this.options = _.extend({}, this.options);
      this.options = _.extend(this.options, options);
      this.initialize(this.options);
    };
    _.extend(HistoryLocation.prototype, {
      path: '',

      options: {
        pushState: false,
        root: '/'
      },

      initialize: function (options) {
        var self = this;
        this.locationBar = new LocationBar();
        this.locationBar.onChange(function (path) {
          self.handleURL('/' + (path || ''));
        });
        this.locationBar.start(_.extend(options));
      },

      usesPushState: function () {
        return this.options.pushState;
      },

      getURL: function () {
        return this.path;
      },

      navigate: function (url) {
        this.locationBar.update(url, {trigger: true});
      },

      setURL: function (path) {
        if (this.path !== path) {
          this.path = path;
          this.locationBar.update(path, {trigger: false});
        }
      },

      replaceURL: function (path) {
        if (this.path !== path) {
          this.path = path;
          this.locationBar.update(path, {trigger: false, replace: true});
        }
      },

      // callback for what to do when backbone router handlers a URL
      // change
      onChange: function (callback) {
        this.changeCallback = callback;
      },

      /**
        initially, the changeCallback won't be defined yet, but that's good 
        because we dont' want to kick off routing right away, the router
        does that later by manually calling this handleURL method with the
        url it reads of the location. But it's important this is called
        first by Backbone, because we wanna set a correct this.path value
       */
      handleURL: function (url) {
        this.path = url;
        if (this.changeCallback) {
          this.changeCallback(url);
        }
      },

      formatURL: function (url) {
        if (this.locationBar.hasPushState()) {
          var rootURL = this.options.root;

          if (url !== '') {
            rootURL = rootURL.replace(/\/$/, '');
          }

          return rootURL + url;
        } else {
          if (url[0] === '/') {
            url = url.substr(1);
          }
          return '#' + url;
        }
      },

      destroy: function () {
        this.locationBar.stop();
      }
    });

    return HistoryLocation;
  });
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });