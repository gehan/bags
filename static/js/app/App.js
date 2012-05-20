// Generated by CoffeeScript 1.3.1

define(['core/Router', 'app/views/App'], function(Router, AppView) {
  return new Class({
    Extends: Router,
    routes: {
      '': 'root',
      'page/*path': 'pageRouter',
      'account/*path': 'accountRouter'
    },
    viewClass: AppView,
    subRouteEl: function() {
      return this.view.refs.body;
    },
    root: function() {
      if (!this.initialRoute) {
        this.reset();
      }
      return console.log('app root');
    },
    pageRouter: function(args, data) {
      var _this = this;
      return curl(['app/routers/PageRouter'], function(PageRouter) {
        return _this._subRoute(PageRouter, args, data, {
          el: _this.subRouteEl()
        });
      });
    },
    accountRouter: function(args, data) {
      var _this = this;
      return curl(['app/routers/AccountRouter'], function(AccountRouter) {
        return _this._subRoute(AccountRouter, args, data, {
          el: _this.subRouteEl()
        });
      });
    }
  });
});
