
define(['core/Router', 'app/views/Account'], function(Router, AccountViews) {
  return new Class({
    Extends: Router,
    routes: {
      '': 'root',
      'user/': 'user',
      'user/:id/': 'user',
      'channel/': 'channel',
      'channel/:id/': 'channel'
    },
    viewClass: AccountViews.Root,
    root: function(args, data) {
      if (!this.initialRoute) {
        this.reset();
      }
      return console.log('root');
    },
    account: function(args, data) {
      return console.log('account ', args.type, args.id);
    },
    channel: function(args, data) {
      return this.initSubView(AccountViews.Channel, this.view.refs.accountBody);
    },
    user: function(args, data) {
      return this.initSubView(AccountViews.User, this.view.refs.accountBody);
    }
  });
});
