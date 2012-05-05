// Generated by CoffeeScript 1.3.1
var App;

App = new Class({
  Extends: Router,
  routes: {
    'page/:pageId/': 'page',
    'page/:pageId/:section/': 'page',
    'page/:pageId/:section/:pageNumber/': 'page',
    'account/:section/:id/': 'account'
  },
  page: function(args, data) {
    var page, pageId, section;
    pageId = args.pageId;
    section = args.section || 'unread';
    page = args.page || 1;
    return console.log('page id ', pageId, ' section ', section, ' number ', page, ' data ', data);
  },
  account: function(args, data) {
    var itemId, section;
    section = args.section || 'sources';
    itemId = args.id;
    return console.log('account ', section, itemId);
  }
});
