var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

define(['core/Collection'], function(Collection) {
  var Model;
  return Model = new Class({
    Implements: [Events, Options],
    _attributes: {},
    collections: {},
    _types: {},
    _defaults: {},
    _idField: "id",
    url: "/item/",
    initialize: function(attributes, options) {
      this.setOptions(options);
      this._setInitial(attributes);
      return this;
    },
    _setInitial: function(attributes) {
      var attrKeys, defaults,
        _this = this;
      if (attributes == null) {
        attributes = {};
      }
      defaults = Object.map(Object.clone(this._defaults), function(value, key) {
        return _this._getDefault(key);
      });
      attrKeys = Object.keys(attributes);
      defaults = Object.filter(defaults, function(value, key) {
        return __indexOf.call(attrKeys, key) < 0;
      });
      Object.merge(attributes, defaults);
      return this.setMany(attributes, {
        silent: true
      });
    },
    setMany: function(attrs, options) {
      var k, v, _results;
      _results = [];
      for (k in attrs) {
        v = attrs[k];
        _results.push(this.set(k, v, options));
      }
      return _results;
    },
    set: function(key, value, options) {
      if (options == null) {
        options = {
          silent: false
        };
      }
      if (this._isCollection(key, value)) {
        this._attributes[key] = this._addCollection(key, value);
      } else {
        this._attributes[key] = this._makeValue(key, value);
        if (key === this._idField) {
          this.id = value;
        }
      }
      if (!options.silent) {
        this.fireEvent("change", [key, value]);
        return this.fireEvent("change:" + key, [value]);
      }
    },
    get: function(key) {
      return this._attributes[key];
    },
    has: function(key) {
      return this._attributes[key] != null;
    },
    _getType: function(name) {
      var type;
      type = this._types[name];
      if (typeOf(type) === "function") {
        return type();
      } else if (typeOf(type) === "string") {
        return window[type];
      } else {
        return type;
      }
    },
    _addCollection: function(key, value, options) {
      var collection, collectionClass;
      if (options == null) {
        options = {};
      }
      collectionClass = this._getType(key);
      collection = new collectionClass(value, {
        parentModel: this
      });
      this.collections[key] = collection;
      this.fireEvent('addCollection', [key, collection]);
      return collection;
    },
    _isCollection: function(key, value) {
      var type;
      type = this._getType(key);
      return (type != null) && typeOf(value) === 'array' && instanceOf(new type(), Collection);
    },
    _makeValue: function(key, value) {
      var item, type, _i, _len, _results;
      type = this._getType(key);
      if (typeOf(value) === 'array') {
        _results = [];
        for (_i = 0, _len = value.length; _i < _len; _i++) {
          item = value[_i];
          _results.push(this._makeValue(key, item));
        }
        return _results;
      } else if (!type) {
        return value;
      } else if (type === String) {
        return String(value);
      } else if (type === Number) {
        return Number.from(value);
      } else if (type === Date) {
        return Date.parse(value);
      } else if (instanceOf(new type(), Model)) {
        value = value || {};
        value._parent = this;
        return new type(value);
      } else {
        return new type(value);
      }
    },
    _getDefault: function(key) {
      var def;
      def = this._defaults[key];
      if (typeOf(def) === 'function') {
        return def.call(this);
      } else {
        return def;
      }
    },
    fetch: function(options) {
      var _this = this;
      if (options == null) {
        options = {};
      }
      if (this.request != null) {
        this.request.cancel();
      }
      return this.request = new Request.JSON({
        url: "" + (options.url || this.url) + this.id + "/",
        method: 'get',
        onSuccess: function(response) {
          return _this._fetchDone(response, options);
        }
      }).send();
    },
    _fetchDone: function(response, options) {
      var model;
      if (options == null) {
        options = {};
      }
      model = this.parseResponse(response);
      this.setMany(model, {
        silent: true
      });
      return this.fireEvent('fetch', [true]);
    },
    parseResponse: function(response) {
      return response;
    },
    save: function() {
      return console.log('save friend');
    },
    toJSON: function() {
      var attrs, key, value, _ref;
      attrs = {};
      _ref = this._attributes;
      for (key in _ref) {
        value = _ref[key];
        attrs[key] = this._jsonKeyValue(key, value);
      }
      delete attrs._parent;
      return attrs;
    },
    _jsonKeyValue: function(key, value) {
      var jsonFn, v, _i, _len, _results;
      jsonFn = "json" + (key.capitalize());
      if (this[jsonFn] != null) {
        return this[jsonFn](value);
      } else if (key === '_parent') {

      } else if (typeOf(value) === 'array') {
        _results = [];
        for (_i = 0, _len = value.length; _i < _len; _i++) {
          v = value[_i];
          _results.push(this._jsonValue(v));
        }
        return _results;
      } else {
        return this._jsonValue(value);
      }
    },
    _jsonValue: function(value) {
      if (typeOf(value) === 'object' && typeOf(value.toJSON) === 'function') {
        return value.toJSON();
      } else {
        return value;
      }
    },
    remove: function() {
      return this.fireEvent('remove', [this]);
    }
  });
});
