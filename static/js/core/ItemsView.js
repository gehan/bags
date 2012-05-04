var ItemsView;

ItemsView = new Class({
  Extends: View,
  initialize: function() {
    var model, self, _i, _len, _ref,
      _this = this;
    self = this;
    this.parent.apply(this, arguments);
    this.collection.addEvent('fetch', function() {
      return _this.render();
    });
    this.collection.addEvent('add', function(model) {
      return _this.addOne(model);
    });
    this.collection.addEvent('remove', function(model) {
      return _this.removeOne(model);
    });
    this.collection.addEvent('reset', function(collection) {
      return _this.add(collection);
    });
    _ref = this.collection;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      model = _ref[_i];
      this.addOne(model);
    }
    return this;
  },
  render: function() {},
  add: function(collection) {
    var model, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = collection.length; _i < _len; _i++) {
      model = collection[_i];
      _results.push(this.addOne(model));
    }
    return _results;
  },
  addOne: function(model) {
    return this.el.adopt($(new ItemView({
      model: model
    })));
  },
  removeOne: function(model) {
    return model.remove();
  }
});
