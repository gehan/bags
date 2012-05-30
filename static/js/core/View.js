
define(['core/Template'], function(Template) {
  return new Class({
    Implements: [Options, Events, Template],
    model: null,
    collection: null,
    el: null,
    events: {},
    template: null,
    options: {
      injectTo: null
    },
    initialize: function(options) {
      var key, _i, _len, _ref,
        _this = this;
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
      if (this.model != null) {
        this.model.addEvent('remove', function() {
          return _this.destroy();
        });
      }
      this.setOptions(options);
      this.render();
      if (this.options.injectTo != null) {
        this.inject(this.options.injectTo);
      }
      return this;
    },
    /*
        Renders the element, if already rendered then
        replaces the current element
    */

    render: function(data) {
      var container, el;
      el = this._render(data);
      el.store('view', this);
      if (!(this.el != null)) {
        this.el = el;
      } else {
        this._replaceCurrentEl(el);
      }
      Object.merge(this.refs, this.getRefs(el));
      this.delegateEvents(this.el, this.events);
      this.fireEvent('render');
      container = Array.from(el)[0].getParent();
      this._checkDomUpdate(container);
      return el;
    },
    _replaceCurrentEl: function(el) {
      var _this = this;
      if (!instanceOf(el, Array)) {
        return this.el = el.replaces(this.el);
      } else {
        return this.el.each(function(currentEl, idx) {
          return _this.el[idx] = el[idx].replaces(currentEl);
        });
      }
    },
    /*
        Use to rerender a template partially, can be used to preserve
        visual state in template. Doesn't alter events as assumed
        to be run on a child node.
    */

    rerender: function(refs, data) {
      var el,
        _this = this;
      el = this._render(data);
      return Array.from(refs).each(function(ref) {
        var newEl, replaceThis;
        replaceThis = _this.refs[ref];
        if (!replaceThis) {
          throw "Cannot find ref " + ref + " in template " + _this.template;
        }
        newEl = _this.getRefs(el)[ref];
        Object.merge(_this.refs, _this.getRefs(newEl));
        _this.refs[ref].replaces(replaceThis);
        return _this._checkDomUpdate(newEl.getParent());
      });
    },
    _render: function(data) {
      var el;
      if (data == null) {
        data = this.parseForDisplay();
      }
      return el = this.renderTemplate(this.template, data);
    },
    inject: function(container, el) {
      if (el == null) {
        el = $(this);
      }
      el.inject(container);
      return this._checkDomUpdate(container);
    },
    _checkDomUpdate: function(container) {
      var inDom, parent;
      inDom = false;
      parent = container;
      if (parent === document.body) {
        inDom = true;
      }
      while (parent = $(parent).getParent()) {
        if (parent === document.body) {
          inDom = true;
        }
      }
      if (inDom) {
        return document.fireEvent('domupdated', [container]);
      }
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
    destroy: function() {
      return $(this).destroy();
    },
    toElement: function() {
      return this.el;
    }
  });
});
