
define(['templates/Page', 'core/View', 'app/Collection', 'app/Model', 'app/views/Item'], function(tpl, View, ItemCollection, PageModel, ItemView) {
  return new Class({
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
      var _this = this;
      if (!(this.pageModel != null)) {
        this.pageModel = new PageModel({}, {
          onFetch: function() {
            _this.data.page = _this.pageModel.toJSON();
            return _this.rerender(['leftNav', 'page-top']);
          }
        });
      }
      if (this.data.pageId !== pageId) {
        this.data.pageId = pageId;
        this.pageModel.set('id', pageId);
        return this.pageModel.fetch();
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
    addOne: function(model, injectTo) {
      if (injectTo == null) {
        injectTo = this.refs.items;
      }
      return (new ItemView({
        model: model
      })).inject(injectTo);
    },
    removeOne: function(model) {},
    renderCollection: function(collection) {
      var fragment, model, _i, _len;
      if (collection == null) {
        collection = this.collection;
      }
      if (this.lastModels != null) {
        this.lastModels.invoke('remove');
      }
      fragment = document.createDocumentFragment();
      for (_i = 0, _len = collection.length; _i < _len; _i++) {
        model = collection[_i];
        this.addOne(model, fragment);
      }
      return this.inject(this.refs.items, fragment);
    },
    _removeCollectionItems: function() {
      return this.lastModels = this.collection.clone();
    },
    destroy: function() {
      this._removeCollectionItems();
      return this.parent();
    }
  });
});
