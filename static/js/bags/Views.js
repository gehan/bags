(function() {

  define(['bags/View'], function(View) {
    return {
      CollectionView: new Class({
        Extends: View,
        Binds: ['_sortViews', '_sortCollection', '_collectionAdd'],
        initialize: function(collection, listEl, modelView, options) {
          this.collection = collection;
          this.listEl = listEl;
          this.modelView = modelView;
          this.collection.addEvents({
            add: this._collectionAdd,
            sort: this._sortViews
          });
          this._sortCollection({
            silent: true
          });
          this._createModelViews();
          return this;
        },
        _createModelViews: function() {
          var model, _i, _len, _ref, _results;
          _ref = this.collection;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            model = _ref[_i];
            _results.push(this._createModelView(model));
          }
          return _results;
        },
        _createModelView: function(model) {
          var view;
          view = new this.modelView({
            model: model,
            onRender: this._sortCollection
          });
          return this.listEl.adopt($(view));
        },
        _collectionAdd: function(model) {
          this._createModelView(model);
          return this._sortCollection();
        },
        _sortCollection: function(options) {
          if (options == null) {
            options = {};
          }
          if (this.collection.sortField) {
            return this.collection.sortBy(this.collection.sortField, options);
          }
        },
        _sortViews: function() {
          return this.reorderViews(this.collection, this.listEl);
        },
        destroy: function() {
          this.collection.removeEvents({
            add: this._collectionAdd,
            sort: this._sortViews
          });
          return this.destroyViews(this.listEl);
        }
      })
    };
  });

}).call(this);
