var AccountView, AppView, PageView;

AppView = new Class({
  Extends: View,
  template: 'base',
  initialize: function() {
    this.parent.apply(this, arguments);
    this.router = new Application({
      view: this
    }).attach();
    this.router.startRoute();
    return this;
  }
});

PageView = new Class({
  Extends: View,
  template: 'page',
  data: {
    pageId: null
  },
  initialize: function() {
    this.parent.apply(this, arguments);
    this.collection = new ItemCollection;
    return this;
  },
  setPage: function(pageId) {
    if (this.data.pageId !== pageId) {
      this.data.pageId = pageId;
      return this.rerender('leftNav');
    }
  },
  getSection: function(section) {
    return this.data.section = section;
  }
});

AccountView = new Class({
  Extends: View,
  template: 'account'
});
