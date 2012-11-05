
/*
Class to allow convenient rendering of mustache templates
Ideally used as a mixin to add this ability to classes but can be used as a standalone
*/


(function() {

  define(function() {
    return new Class({
      TEMPLATES: {},
      refs: {},
      loadAllTemplates: function() {
        var k, v, _i, _len, _ref, _ref1, _results;
        _ref = this.TEMPLATES;
        for (k in _ref) {
          v = _ref[k];
          this._loadTemplate(k);
        }
        _ref1 = $$('script[type=text/html]').get('template');
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          k = _ref1[_i];
          _results.push(this._loadTemplate(k));
        }
        return _results;
      },
      renderTemplate: function(templateName, data, events) {
        var els, rendered;
        if (data == null) {
          data = {};
        }
        if (events == null) {
          events = null;
        }
        rendered = this._renderDustTemplate(templateName, data);
        els = Elements.from(rendered);
        if (events != null) {
          this.delegateEvents(els, events);
        }
        if (els.length === 1) {
          return els[0];
        } else {
          return els;
        }
      },
      getRefs: function(els, ref) {
        var el, elRefName, refEl, refName, refs, _i, _j, _len, _len1, _ref, _ref1;
        if (ref == null) {
          ref = null;
        }
        refs = {};
        _ref = Array.from(els);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          el = _ref[_i];
          elRefName = el.get('ref');
          if (ref && elRefName === ref) {
            return el;
          }
          if (elRefName) {
            refs[elRefName] = el;
          }
          _ref1 = el.getElements("*[ref]");
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            refEl = _ref1[_j];
            refName = refEl.get('ref');
            if (ref && refName === ref) {
              return refEl;
            }
            refs[refName] = refEl;
          }
        }
        return refs;
      },
      getRef: function(el, ref) {
        return this.getRefs(el, ref);
      },
      _renderDustTemplate: function(templateName, data) {
        var rendered;
        if (data == null) {
          data = {};
        }
        this._loadTemplate(templateName);
        data = Object.clone(data);
        data["let"] = data || 0;
        rendered = "";
        dust.render(templateName, data, function(err, out) {
          return rendered = out;
        });
        return rendered;
      },
      _loadTemplate: function(templateName) {
        var compiled;
        if (!(dust.cache[templateName] != null)) {
          compiled = dust.compile(this.getTemplate(templateName), templateName);
          return dust.loadSource(compiled);
        }
      },
      getTemplate: function(templateName) {
        var template;
        if (this.TEMPLATES != null) {
          template = this.TEMPLATES[templateName];
        }
        if (template != null) {
          return template;
        }
        template = document.getElement("script[template=" + templateName + "]");
        if (template != null) {
          return template.get('html');
        }
        throw "Cannot find template " + templateName;
      },
      delegateEvents: function(el, events, preventDefault) {
        var boundFn, els, eventKey, fnName, node, _results;
        els = Array.from(el);
        _results = [];
        for (eventKey in events) {
          fnName = events[eventKey];
          boundFn = function(fnName, event, target) {
            if (preventDefault) {
              event.preventDefault();
            }
            return this[fnName](event, target);
          };
          boundFn = boundFn.bind(this, fnName);
          _results.push((function() {
            var _i, _len, _results1;
            _results1 = [];
            for (_i = 0, _len = els.length; _i < _len; _i++) {
              node = els[_i];
              _results1.push(this._addDelegatedEvent(node, eventKey, boundFn));
            }
            return _results1;
          }).call(this));
        }
        return _results;
      },
      _addDelegatedEvent: function(el, eventKey, fn) {
        var mtEvent;
        eventKey = eventKey.split(":");
        mtEvent = "" + eventKey[0] + ":relay(" + eventKey[1] + ")";
        return el.addEvent(mtEvent, fn);
      }
    });
  });

}).call(this);
