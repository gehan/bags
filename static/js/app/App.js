(function() {

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
        return console.log('apps root');
      },
      pageRouter: function(args, data) {
        var _this = this;
        console.log('loading page');
        return curl(['app/routers/Page'], function(PageRouter) {
          console.log('loaded page');
          return _this._subRoute(PageRouter, args, data, {
            el: _this.subRouteEl()
          });
        });
      },
      accountRouter: function(args, data) {
        var _this = this;
        return curl(['app/routers/Account'], function(AccountRouter) {
          return _this._subRoute(AccountRouter, args, data, {
            el: _this.subRouteEl()
          });
        });
      }
    });
  });

}).call(this);
