var View;

View = new Class({
  Extends: Templates,
  Implements: [Options, Events],
  model: null,
  collection: null,
  el: null,
  template: null,
  initialize: function(options) {
    var key, _i, _len, _ref;
    if (options == null) options = {};
    this.loadAllTemplates();
    _ref = ['collection', 'model', 'el', 'template'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      if (options[key] != null) {
        this[key] = options[key];
        delete options[key];
      }
    }
    this.setOptions(options);
    if (this.template) this.render();
    return this;
  },
  render: function() {
    return this.parent(this.parseForDisplay());
  },
  parseForDisplay: function() {
    return this.model.toJSON();
  },
  getElement: function() {
    return this.el.getElement.apply(this.el, arguments);
  },
  getElements: function() {
    return this.el.getElements.apply(this.el, arguments);
  }
});
