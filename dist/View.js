define(['bags/Template', 'bags/Events'], function(Template, Events) {
  return new Class({
    Implements: [Options, Events, Template],
    Binds: ['destroy'],
    template: null,
    events: {},
    el: null,
    model: null,
    data: {},
    parsers: {},
    options: {
      injectTo: null,
      autoDestroyModel: false
    },
    initialize: function(options) {
      var key, _i, _len, _ref;

      if (options == null) {
        options = {};
      }
      this.loadAllTemplates();
      _ref = ['model', 'el'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        if (options[key] != null) {
          this[key] = options[key];
          delete options[key];
        }
      }
      this.setOptions(options);
      if ((this.model != null) && this.options.autoDestroyModel) {
        this.model.addEvent('destroy', this.destroy);
      }
      this.render(options.data, {
        silent: true
      });
      if (this.options.injectTo != null) {
        this.inject(this.options.injectTo);
      }
      return this;
    },
    render: function(data, options) {
      var container, el;

      if (data == null) {
        data = {};
      }
      if (options == null) {
        options = {};
      }
      el = this._render(data);
      el.store('view', this);
      if (this.el == null) {
        this.el = el;
      } else {
        this._replaceCurrentEl(el);
      }
      this.refs = this.getRefs(el);
      this.delegateEvents(this.el, this.events);
      container = Array.from(el)[0].getParent();
      this._checkDomUpdate(container);
      if (!options.silent) {
        this.fireEvent('render');
      }
      return el;
    },
    parseForDisplay: function(model) {
      return this.model.toJSON();
    },
    rerender: function(refs, data, options) {
      var el,
        _this = this;

      if (data == null) {
        data = {};
      }
      if (options == null) {
        options = {};
      }
      el = this._render(data);
      Array.from(refs).each(function(ref) {
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
      if (!options.silent) {
        return this.fireEvent('rerender');
      }
    },
    inject: function(container, el) {
      if (el == null) {
        el = this.el;
      }
      el.inject(container);
      return this._checkDomUpdate(container);
    },
    getElement: function() {
      return this.el.getElement.apply(this.el, arguments);
    },
    getElements: function() {
      return this.el.getElements.apply(this.el, arguments);
    },
    getViews: function(el) {
      var els;

      els = el.getChildren();
      return els.retrieve('view');
    },
    reorderViews: function(collection, rootEl) {
      var current, desiredIndex, dummy, swap, view, views, _i, _len, _results;

      views = this.getViews(rootEl);
      _results = [];
      for (_i = 0, _len = views.length; _i < _len; _i++) {
        view = views[_i];
        dummy = new Element('div');
        current = $(view);
        desiredIndex = collection.indexOf(view.model);
        swap = rootEl.getChildren()[desiredIndex];
        dummy.inject(current, 'before');
        current.inject(swap, 'before');
        swap.inject(dummy, 'before');
        _results.push(dummy.destroy());
      }
      return _results;
    },
    destroyViews: function(el) {
      var views;

      views = this.getViews(el);
      if (views === null) {
        return;
      }
      return views.invoke('destroy');
    },
    destroy: function() {
      if ((this.model != null) && this.options.autoDestroyModel) {
        this.model.removeEvent('destroy', this.destroy);
      }
      this.el.eliminate('view');
      return this.el.destroy();
    },
    toElement: function() {
      return this.el;
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
    _render: function(data) {
      var el;

      if (data == null) {
        data = {};
      }
      data = this._getTemplateData(data);
      return el = this.renderTemplate(this.template, data);
    },
    _getTemplateData: function(data) {
      var fieldName, parser, _ref;

      if (data == null) {
        data = {};
      }
      data = Object.merge(this.data, data);
      if (this.model != null) {
        data = Object.merge({}, this.parseForDisplay(this.model), data);
      }
      _ref = this.parsers;
      for (fieldName in _ref) {
        parser = _ref[fieldName];
        data[fieldName] = parser.call(this, data);
      }
      return data;
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
    }
  });
});
