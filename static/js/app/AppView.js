// Generated by CoffeeScript 1.3.1
var AccountView, AppView, ChannelView, ItemView, PageView, UserView;

AppView = new Class({
  Extends: View,
  template: 'base'
});

PageView = new Class({
  Extends: View,
  Binds: ['renderCollection', 'addOne', 'removeOne'],
  template: 'page',
  data: {
    pageId: null
  },
  initialize: function() {
    this.parent.apply(this, arguments);
    this.collection = new ItemCollection(Globals._preload || [], {
      onAdd: this.addOne,
      onRemove: this.removeOne,
      onReset: this.renderCollection
    });
    if (Globals._preload) {
      this.renderCollection();
    }
    return this;
  },
  setPage: function(pageId) {
    if (this.data.pageId !== pageId) {
      this.data.pageId = pageId;
      return this.rerender('leftNav');
    }
  },
  getSection: function(section) {
    this.data.section = section;
    if (Globals._preload != null) {
      return delete Globals._preload;
    } else {
      this._removeCollectionItems();
      return this.collection.fetch(this.data);
    }
  },
  addOne: function(model) {
    return $(new ItemView({
      model: model
    })).inject(this.refs.items);
  },
  removeOne: function(model) {},
  renderCollection: function(collection) {
    var model, _i, _len, _results;
    if (collection == null) {
      collection = this.collection;
    }
    _results = [];
    for (_i = 0, _len = collection.length; _i < _len; _i++) {
      model = collection[_i];
      _results.push(this.addOne(model));
    }
    return _results;
  },
  _removeCollectionItems: function() {
    var models;
    models = this.collection.clone();
    return models.invoke('remove');
  },
  destroy: function() {
    this._removeCollectionItems();
    return this.parent();
  }
});

AccountView = new Class({
  Extends: View,
  template: 'account'
});

ItemView = new Class({
  Extends: View,
  template: 'item',
  events: {
    "click:em": "textClicked"
  },
  textClicked: function() {
    return console.log('hello there ', this.model.toJSON());
  }
});

UserView = new Class({
  Extends: View,
  template: 'user'
});

ChannelView = new Class({
  Extends: View,
  template: 'channel'
});
