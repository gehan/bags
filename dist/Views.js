(function() {

  define(['bags/View'], function(View) {
    return {
      CollectionView: new Class({
        Extends: View,
        Binds: ['_sortViews', '_collectionAdd'],
        initialize: function(collection, listEl, modelView, options) {
          this.collection = collection;
          this.listEl = listEl;
          this.modelView = modelView;
          this.setOptions(options);
          this.collection.addEvents({
            add: this._collectionAdd,
            sort: this._sortViews
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
          var view,
            _this = this;
          return view = new this.modelView({
            autoDestroyModel: true,
            model: model,
            injectTo: this.listEl,
            onRender: function() {
              _this._sortCollection();
              return _this.fireEvent('render', [view].combine(arguments));
            },
            onDelete: function() {
              return _this.fireEvent('delete', [view].combine(arguments));
            }
          });
        },
        _collectionAdd: function(model) {
          this._createModelView(model);
          return this._sortViews();
        },
        _sortCollection: function() {
          if (this.collection.sortField != null) {
            return this.collection.sortBy(this.collection.sortField);
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
