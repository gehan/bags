(function() {

  define(['bags/View'], function(View) {
    return {
      CollectionView: new Class({
        Extends: View,
        Binds: ['_sortCollection'],
        initialize: function(collection, listEl, modelView) {
          var ret;
          this.collection = collection;
          this.listEl = listEl;
          this.modelView = modelView;
          ret = this.parent.apply(this, arguments);
          this.collection.addEvents({
            sort: this._sortCollection,
            saveSuccess: this._sortCollection
          });
          return ret;
        },
        _createModelViews: function() {
          var model, view, _i, _len, _ref, _results;
          _ref = this.collection;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            model = _ref[_i];
            view = new this.modelView({
              model: model
            });
            _results.push(this.listEl.adopt($(view)));
          }
          return _results;
        },
        _sortCollection: function() {
          return this.reorderViews(this.collection, this.listEl);
        },
        destroy: function() {
          this.collection.addEvents({
            sort: this._sortCollection,
            saveSuccess: this._sortCollection
          });
          return this.parent.apply(this, arguments);
        }
      })
    };
  });

}).call(this);
