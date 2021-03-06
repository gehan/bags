define(['./View'], function(View) {
  return {
    CollectionView: new Class({
      Extends: View,
      Binds: ['_sortViews', '_collectionAdd'],
      options: {
        itemEmptyView: null,
        itemViewOptions: {}
      },
      initialize: function(collection, listEl, modelView, options) {
        var _this = this;
        this.collection = collection;
        this.listEl = listEl;
        this.modelView = modelView;
        if (options == null) {
          options = {};
        }
        this.setOptions(options);
        this.collection.addEvents({
          add: this._collectionAdd,
          sort: this._sortViews,
          remove: function(model) {
            _this._removeModelsView(model);
            return _this._toggleEmptyViewIfEmpty();
          }
        });
        this._createModelViews();
        this._toggleEmptyViewIfEmpty();
        this.sort();
        return this;
      },
      getModelsView: function(model) {
        var view, views, _i, _len;
        views = this.getViews(this.listEl);
        for (_i = 0, _len = views.length; _i < _len; _i++) {
          view = views[_i];
          if (view.model === model) {
            return view;
          }
        }
      },
      _removeModelsView: function(model) {
        var view;
        view = this.getModelsView(model);
        if (view != null) {
          return view.destroy();
        }
      },
      _toggleEmptyViewIfEmpty: function() {
        if (!this.options.itemEmptyView) {
          return;
        }
        if (this.collection.length === 0) {
          return this._showEmptyItem();
        } else {
          return this._hideEmptyItem();
        }
      },
      sort: function() {
        if (this.collection.sortField != null) {
          return this.collection.sortBy(this.collection.sortField);
        }
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
        var options, view,
          _this = this;
        options = Object.clone(this.options.itemViewOptions);
        Object.append(options, {
          autoDestroyModel: true,
          model: model,
          injectTo: this.listEl,
          onAny: function(event, args) {
            if (args == null) {
              args = [];
            }
            if (event === 'render' || event === 'rerender') {
              _this.sort();
            }
            return _this.fireEvent(event, [view].combine(args));
          }
        });
        return view = new this.modelView(options);
      },
      _collectionAdd: function(model) {
        this._toggleEmptyViewIfEmpty();
        this._createModelView(model);
        return this._sortViews();
      },
      _showEmptyItem: function() {
        if (this._emptyItem) {
          return;
        }
        this._emptyItem = new this.options.itemEmptyView(this.options.itemViewOptions);
        return this._emptyItem.inject(this.listEl);
      },
      _hideEmptyItem: function() {
        if (!this._emptyItem) {
          return;
        }
        this._emptyItem.destroy();
        return delete this._emptyItem;
      },
      _sortViews: function() {
        if (!(this.collection.length > 0)) {
          return;
        }
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
