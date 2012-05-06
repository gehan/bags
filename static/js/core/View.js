// Generated by CoffeeScript 1.3.1
var View;

View = new Class({
  Implements: [Options, Events, Templates],
  model: null,
  collection: null,
  el: null,
  events: {},
  template: null,
  initialize: function(options) {
    var key, _i, _len, _ref;
    if (options == null) {
      options = {};
    }
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
    this.render();
    return this;
  },
  /*
      Renders the element, if already rendered then
      replaces the current element
  */

  render: function(data) {
    var el;
    el = this._render(data);
    el.store('obj', this);
    this.el = this.el ? el.replaces(this.el) : el;
    Object.merge(this.refs, this.getRefs(el));
    this.delegateEvents(el, this.events);
    this.fireEvent('render');
    return el;
  },
  /*
      Use to rerender a template partially, can be used to preserve
      visual state in template
  */

  rerender: function(refs, data) {
    var el,
      _this = this;
    el = this._render(data);
    return Array.from(refs).each(function(ref) {
      var newEl, replaceThis;
      replaceThis = _this.refs[ref];
      if (!replaceThis) {
        throw "Cannot find ref " + ref + " in template " + template;
      }
      newEl = _this.getRefs(el)[ref];
      Object.merge(_this.refs, _this.getRefs(newEl));
      return _this.refs[ref].replaces(replaceThis);
    });
  },
  _render: function(data) {
    var el;
    if (data == null) {
      data = this.parseForDisplay();
    }
    return el = this.renderTemplate(this.template, data);
  },
  inject: function() {
    var el;
    el = $(this);
    el.inject.apply(el, arguments);
    return document.fireEvent('domupdated');
  },
  parseForDisplay: function() {
    if (this.model != null) {
      return this.model.toJSON();
    } else {
      return this.data;
    }
  },
  getElement: function() {
    return this.el.getElement.apply(this.el, arguments);
  },
  getElements: function() {
    return this.el.getElements.apply(this.el, arguments);
  },
  destroy: function() {},
  toElement: function() {
    return this.el;
  }
});
