define(function(){;
var Router, reCombine, reParam, reSplat;

reParam = "\\:(\\w+)";

reSplat = "\\*(\\w+)";

reCombine = new RegExp("" + reParam + "|" + reSplat, 'g');

Router = new Class({
  Implements: [Options, Events],
  Binds: ['_startRoute', '_getHtml4AtRoot'],
  routes: {},
  subRouteEl: function() {},
  viewClass: null,
  options: {
    forceHTML4ToRoot: false,
    el: null
  },
  initialize: function(options) {
    this.setOptions(options);
    this._parseRoutes();
    if (this.viewClass != null) {
      this._initView();
    }
    this.initialRoute = true;
    return this;
  },
  attach: function() {
    if (this.options.forceHTML4ToRoot && History.emulated.pushState) {
      window.addEvent('statechange', this._getHtml4AtRoot);
    }
    window.addEvent('statechange', this._startRoute);
    this._startRoute();
    return this;
  },
  detach: function() {
    return window.removeEvent('statechange', this._startRoute);
  },
  initSubView: function(viewClass, el) {
    if (!instanceOf(this.subView, viewClass)) {
      if (el == null) {
        throw "Cannot init sub view, no el passed in";
      }
      if (this.subView != null) {
        this.subView.destroy();
      }
      this.subView = new viewClass;
      el.empty();
      return this.subView.inject(el);
    }
  },
  _subRoute: function(routerClass, args, data, options) {
    var path;
    if (!instanceOf(this._subRouter, routerClass)) {
      if (this._subRouter != null) {
        this._subRouter.destroy();
      }
      this._subRouter = new routerClass(options);
    }
    if (Object.getLength(args) !== 1) {
      throw "Bad subroute, include one splat only";
    }
    path = Object.values(args)[0];
    return this._subRouter._startRoute(path);
  },
  reset: function() {
    if (this._subRouter != null) {
      this._subRouter.destroy();
      delete this._subRouter;
    }
    if (this.subView != null) {
      this.subView.destroy();
      delete this.subView;
    }
    return this.view.render();
  },
  getCurrentUri: function() {
    return new URI(History.getState().url);
  },
  destroy: function() {
    this._destroyView();
    return this.detach();
  },
  _subRouter: null,
  _parsedRoutes: [],
  _replaceRegex: {
    "([^\/]+)": new RegExp(reParam, 'g'),
    "(.*)": new RegExp(reSplat, 'g')
  },
  _parseRoutes: function(routes) {
    var funcName, paramNames, route, routeRegEx, _results;
    if (routes == null) {
      routes = this.routes;
    }
    _results = [];
    for (route in routes) {
      funcName = routes[route];
      routeRegEx = this._createRouteRegex(route);
      paramNames = this._extractParamPositions(route);
      _results.push(this._parsedRoutes.push([routeRegEx, funcName, paramNames]));
    }
    return _results;
  },
  _createRouteRegex: function(route) {
    var findRe, replaceWith, _ref;
    _ref = this._replaceRegex;
    for (replaceWith in _ref) {
      findRe = _ref[replaceWith];
      route = route.replace(findRe, replaceWith);
    }
    return new RegExp("^" + route + '$');
  },
  _extractParamPositions: function(route) {
    var params, s;
    params = [];
    while ((s = reCombine.exec(route))) {
      params.push(s.slice(1).erase('').pick());
    }
    return params;
  },
  _startRoute: function(path, data) {
    var uri;
    uri = this.getCurrentUri();
    if (path == null) {
      path = uri.get('directory') + uri.get('file');
    }
    if (data == null) {
      data = uri.getData();
    }
    this._route(path, data);
    return this.initialRoute = false;
  },
  _route: function(path, data) {
    var args, funcName, match, paramNames, regEx, routerClass, _i, _len, _ref, _ref1;
    if (path.substr(0, 1) === '/') {
      path = path.substr(1);
    }
    _ref = this._parsedRoutes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref1 = _ref[_i], regEx = _ref1[0], funcName = _ref1[1], paramNames = _ref1[2];
      match = regEx.exec(path);
      if (match != null) {
        args = match.slice(1).associate(paramNames);
        if (typeOf(funcName) === 'function') {
          routerClass = funcName();
          return this._subRoute(routerClass, args, data, {
            el: this.subRouteEl()
          });
        } else {
          args = [args];
          args.push(data);
          if (match != null) {
            return this[funcName].apply(this, args);
          }
        }
      }
    }
  },
  _getHtml4AtRoot: function() {
    var hash, href, u, uri;
    u = new URI();
    if (u.get('directory') + u.get('file') !== '/') {
      uri = this.getCurrentUri();
      hash = uri.get('directory') + uri.get('file');
      if (uri.get('query')) {
        hash = "" + hash + "?" + (uri.get('query'));
      }
      href = "/#" + hash;
      return location.href = href;
    }
  },
  _initView: function() {
    if (!instanceOf(this.view, this.viewClass)) {
      if (this.options.el == null) {
        throw "Cannot init view, no el specified";
      }
      this._destroyView();
      return this.view = new this.viewClass({
        injectTo: this.options.el
      });
    }
  },
  _destroyView: function() {
    if (this.view != null) {
      this.view.destroy();
    }
    return this.options.el.empty();
  }
});

return Router;

});
