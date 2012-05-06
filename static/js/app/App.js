// Generated by CoffeeScript 1.3.1
var AccountRouter, AppRouter, PageRouter;

AppRouter = new Class({
  Extends: Router,
  routes: {
    'page/*path': "pageSection",
    'account/*path': "accountSection"
  },
  options: {
    view: null
  },
  subRouter: null,
  pageSection: function(args, data) {
    if (!instanceOf(this.subRouter, PageRouter)) {
      if (this.subRouter != null) {
        this.subRouter.destroy();
      }
      this.subRouter = new PageRouter({
        element: this.options.view.refs.body
      });
    }
    return this.subRouter.startRoute(args.path);
  },
  accountSection: function(args, data) {
    if (!instanceOf(this.subRouter, AccountRouter)) {
      if (this.subRouter != null) {
        this.subRouter.destroy();
      }
      this.subRouter = new AccountRouter({
        element: this.options.view.refs.body
      });
    }
    return this.subRouter.startRoute(args.path);
  }
});

Router.implement({
  setView: function(viewClass) {
    if (!instanceOf(this.view, viewClass)) {
      this.destroyView();
      this.view = new viewClass();
      return this.view.inject(this.options.element);
    }
  },
  destroyView: function() {
    if (this.view != null) {
      this.view.destroy();
    }
    return this.options.element.empty();
  },
  destroy: function() {
    return this.destroyView();
  }
});

AccountRouter = new Class({
  Extends: Router,
  options: {
    element: null
  },
  routes: {
    'user/': 'user',
    'user/:id/': 'user',
    'channel/': 'channel',
    'channel/:id/': 'channel',
    ':type/': 'account',
    ':type/:id/': 'account'
  },
  account: function(args, data) {
    this.setView(AccountView);
    return console.log('account ', args.type, args.id);
  },
  channel: function(args, data) {
    return console.log('channel ', args.id);
  },
  user: function(args, data) {
    return console.log('user ', args.id);
  }
});

PageRouter = new Class({
  Extends: Router,
  options: {
    element: null
  },
  routes: {
    ':page/': 'page',
    ':page/:section/': 'page'
  },
  page: function(args, data) {
    this.setView(PageView);
    return console.log('page ', args.page, args.section);
  }
});
