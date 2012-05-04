var Model;

Model = new Class({
  Implements: [Events, Options],
  _attributes: {},
  collections: {},
  _types: {},
  _defaults: {},
  options: {
    url: "/item/"
  },
  initialize: function(attributes, options) {
    this.setAttributes(attributes);
    this.setOptions(options);
    return this;
  },
  setAttributes: function(attributes) {
    var key, value, _ref, _results;
    if (attributes == null) attributes = {};
    for (key in attributes) {
      value = attributes[key];
      this.set(key, value, {
        silent: true
      });
    }
    _ref = this._defaults;
    _results = [];
    for (key in _ref) {
      value = _ref[key];
      if (!this.has(key)) {
        _results.push(this.set(key, this._getDefault(key, value)));
      } else {
        _results.push(void 0);
      }
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
      this._addCollection(key, value);
    } else {
      this._attributes[key] = this._makeValue(key, value);
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
  _addCollection: function(key, value, options) {
    var collection, collectionClass;
    if (options == null) options = {};
    collectionClass = window[this._types[key]];
    collection = new collectionClass(this, value);
    this.collections[key] = collection;
    return this.fireEvent('addCollection', [key, collection]);
  },
  _isCollection: function(key, value) {
    var type;
    type = window[this._types[key]];
    return (type != null) && typeOf(value) === 'array' && instanceOf(new type(), SubCollection);
  },
  _makeValue: function(key, value) {
    var item, type, _i, _len, _results;
    type = window[this._types[key]];
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
  _getDefault: function(key, value) {
    var def;
    def = this._defaults[key];
    if (typeOf(def) === 'function') {
      return def.call(this);
    } else {
      return def;
    }
  },
  save: function() {
    return console.log('save friend');
  },
  toJSON: function() {
    var attrs, jsonFn, jsonV, key, v, value, _i, _len, _ref;
    attrs = {};
    _ref = this._attributes;
    for (key in _ref) {
      value = _ref[key];
      jsonFn = "json" + (key.capitalize());
      if (this[jsonFn] != null) {
        attrs[key] = this[jsonFn](value);
      } else if (key === '_parent') {} else if (typeOf(value) === 'array') {
        attrs[key] = [];
        for (_i = 0, _len = value.length; _i < _len; _i++) {
          v = value[_i];
          if (typeOf(v) === 'object' && typeOf(v.toJSON) === 'function') {
            jsonV = v.toJSON();
          } else {
            jsonV = v;
          }
          attrs[key].push(jsonV);
        }
      } else if (typeOf(value) === 'object' && typeOf(value.toJSON) === 'function') {
        attrs[key] = value.toJSON();
      } else {
        attrs[key] = value;
      }
    }
    return attrs;
  },
  remove: function() {
    return this.fireEvent('remove', [this]);
  }
});
