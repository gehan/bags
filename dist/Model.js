define(['require', './Api', './Collection', './Exceptions',
    './Events'], function(require, Api, Collection, Exceptions, Events)
    {;
var $extends, Model,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Class.Mutators.Collection = function(collectionDef) {
  if (this.collection) {
    collectionDef = Object.merge({}, this.collection, collectionDef);
  }
  return this.extend({
    collection: collectionDef,
    getCollection: function(models, options) {
      var col, copy, key, value;
      if (models == null) {
        models = [];
      }
      if (options == null) {
        options = {};
      }
      copy = Object.clone(collectionDef);
      col = new copy["class"](models, Object.merge({
        url: this.prototype.url
      }, options));
      for (key in copy) {
        value = copy[key];
        if (value !== 'collection') {
          col[key] = value;
        }
      }
      return col;
    }
  });
};

$extends = Class.Mutators.Extends;

Class.Mutators.Extends = function(parent) {
  if ((parent != null) && parent.collection) {
    Class.Mutators.Collection.apply(this, [parent.collection]);
  }
  return $extends.apply(this, arguments);
};

Model = new Class({
  Implements: [Events, Options, Api],
  Collection: {
    "class": Collection
  },
  fields: {},
  defaults: {},
  properties: {},
  validators: {},
  id: null,
  idField: "id",
  collections: {},
  url: null,
  initialize: function(attributes, options) {
    var key, _i, _len, _ref;
    if (options == null) {
      options = {};
    }
    _ref = ['collection', 'url'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      if (options[key] != null) {
        this[key] = options[key];
        delete options[key];
      }
    }
    this.setOptions(options);
    this._setInitial(attributes);
    return this;
  },
  has: function(key) {
    return this._attributes[key] != null;
  },
  get: (function(key) {
    var _value;
    _value = this._cloneField(key);
    if (this.properties[key] && this.properties[key].get) {
      return this.properties[key].get.call(this, _value);
    } else {
      return _value;
    }
  }).overloadGetter(),
  set: function(key, value, options) {
    var attrs, changed, curVal, dirtyVal, error, k, newVal, v, _attrs;
    if (options == null) {
      options = {};
    }
    if (typeOf(key) === 'object') {
      attrs = key;
      options = value || options;
    } else {
      attrs = {};
      attrs[key] = value;
    }
    _attrs = {};
    try {
      for (k in attrs) {
        v = attrs[k];
        _attrs[k] = this._set(k, v, options);
      }
    } catch (_error) {
      error = _error;
      if (instanceOf(error, Exceptions.Validation)) {
        return false;
      }
    }
    for (key in _attrs) {
      value = _attrs[key];
      if (this._isCollection(key)) {
        this._addCollection(key, value, options);
      }
      curVal = JSON.encode(this._attributes[key]);
      newVal = JSON.encode(value);
      dirtyVal = JSON.encode(this._dirtyFields[key]);
      changed = curVal !== newVal;
      if (this._dirtyFields[key] == null) {
        if (changed) {
          this._dirtyFields[key] = this._attributes[key];
        }
      } else {
        if (newVal === dirtyVal) {
          delete this._dirtyFields[key];
        }
      }
      this._attributes[key] = value;
      if (key === this.idField) {
        this.id = value;
      }
      if (changed && !options.silent) {
        this.fireEvent("change", [key, value]);
        this.fireEvent("change:" + key, [value]);
      }
    }
    return true;
  },
  _set: function(key, value, options) {
    var _value;
    if (this._isCollection(key)) {
      _value = this._makeCollection(key, value);
    } else {
      _value = this._makeValue(key, value);
    }
    if (this.properties[key] && (this.properties[key].set != null)) {
      return this.properties[key].set.call(this, _value, value);
    } else {
      this._validateField(key, _value, options);
      return _value;
    }
  },
  _validateField: function(key, value, options) {
    var result;
    if (options == null) {
      options = {};
    }
    if (this.validators && (this.validators[key] != null)) {
      result = this.validators[key].call(this, value);
      if (result !== true) {
        if (!options.silent) {
          this.fireEvent("error", [key, value, result]);
          this.fireEvent("error:" + key, [value, result]);
        }
        throw new Exceptions.Validation(key, value, result);
      }
    }
    return true;
  },
  isNew: function() {
    return this.id == null;
  },
  isDirty: function() {
    return Object.getLength(this._dirtyFields) > 0;
  },
  clearChanges: function(options) {
    if (options == null) {
      options = {
        silent: true
      };
    }
    this.set(this._dirtyFields, options);
    return this._clearDirtyFields();
  },
  toJSON: function() {
    var attrs, key, value, _ref;
    attrs = {};
    _ref = this._attributes;
    for (key in _ref) {
      value = _ref[key];
      attrs[key] = this._jsonKeyValue(key, value);
    }
    return attrs;
  },
  fetch: function(options) {
    var apiOptions, promise,
      _this = this;
    if (options == null) {
      options = {};
    }
    if (this.isNew()) {
      return;
    }
    apiOptions = Object.merge({
      eventName: 'fetch'
    }, options);
    promise = this.api('read', null, apiOptions);
    return promise.then(function(data) {
      _this.set(data, {
        silent: true
      });
      _this._clearDirtyFields();
      if (!options.silent) {
        _this.fireEvent('fetch', [true]);
      }
      return _this;
    });
  },
  save: function(key, value, options) {
    var ModelClass, apiMethod, apiOptions, attrs, data, promise, setAttrFn, toUpdate,
      _this = this;
    if (options == null) {
      options = {};
    }
    ModelClass = this.$constructor;
    if (key != null) {
      attrs = {};
      if (!this.isNew()) {
        attrs[this.idField] = this.id;
      }
      toUpdate = new ModelClass(attrs, {
        ignoreDefaults: true
      });
      if (key != null) {
        toUpdate.set(key, value, {
          silent: true
        });
      }
    } else {
      toUpdate = new ModelClass(this.toJSON());
    }
    data = toUpdate.toJSON();
    if (typeOf(key, 'object')) {
      options = Object.merge(options, value);
    }
    setAttrFn = function() {
      if (key != null) {
        _this.set(key, value, options);
      }
      return _this._clearDirtyFields();
    };
    if (options.dontWait) {
      setAttrFn();
    }
    apiMethod = this.isNew() ? "create" : "update";
    apiOptions = Object.merge({
      eventName: 'save'
    }, options);
    promise = this.api(apiMethod, data, apiOptions);
    return promise.then(function(data) {
      var model;
      if (!options.dontWait) {
        setAttrFn();
      }
      model = data || {};
      _this.set(model, {
        silent: true
      });
      _this._clearDirtyFields();
      return _this;
    });
  },
  destroy: function(options) {
    var apiOptions, fireEvent, promise,
      _this = this;
    if (options == null) {
      options = {};
    }
    fireEvent = function() {
      if (!options.silent) {
        return _this.fireEvent('destroy');
      }
    };
    if (this.isNew()) {
      fireEvent();
      return;
    }
    if (options.dontWait) {
      fireEvent();
    }
    apiOptions = Object.merge({
      eventName: 'destroy'
    }, options);
    promise = this.api('delete', null, apiOptions);
    return promise.then(function(data) {
      if (!options.dontWait) {
        fireEvent();
      }
      return _this;
    });
  },
  _attributes: {},
  _dirtyFields: {},
  _makeValue: function(key, value) {
    var item, type, val, _i, _len, _results;
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
    } else if (type.prototype && type.prototype.isModel) {
      value = value || {};
      val = new type(value);
      val._parent = this;
      return val;
    } else {
      return new type(value);
    }
  },
  _getType: function(name) {
    var type;
    type = this.fields[name];
    if (typeOf(type) === "function") {
      return type();
    } else if (typeOf(type) === "string") {
      return window[type];
    } else {
      return type;
    }
  },
  _isCollection: function(key) {
    var type;
    type = this._getType(key);
    return (type != null) && type.prototype && type.prototype.isCollection;
  },
  _isModel: function(key) {
    var type;
    type = this._getType(key);
    return (type != null) && type.prototype && type.prototype.isModel;
  },
  _makeCollection: function(key, value) {
    var collectionClass;
    collectionClass = this._getType(key);
    return new collectionClass(value, {
      parentModel: this
    });
  },
  _addCollection: function(key, collection, options) {
    if (options == null) {
      options = {};
    }
    this.collections[key] = collection;
    if (!options.silent) {
      return this.fireEvent('addCollection', [key, collection]);
    }
  },
  _setInitial: function(attributes) {
    var attrKeys, defaults,
      _this = this;
    if (attributes == null) {
      attributes = {};
    }
    if (!this.options.ignoreDefaults) {
      defaults = Object.map(Object.clone(this.defaults), function(value, key) {
        return _this._getDefault(key);
      });
    } else {
      defaults = {};
    }
    attrKeys = Object.keys(attributes);
    defaults = Object.filter(defaults, function(value, key) {
      return __indexOf.call(attrKeys, key) < 0;
    });
    Object.merge(attributes, defaults);
    this.set(attributes, {
      silent: true
    });
    return this._clearDirtyFields();
  },
  _cloneField: function(key) {
    var jsonValue, type, value, _value;
    value = this._attributes[key];
    type = this._getType(key);
    jsonValue = this._jsonKeyValue(key, value);
    if (typeOf(jsonValue) === 'array') {
      _value = jsonValue.clone();
    } else if (typeOf(jsonValue) === 'object') {
      _value = Object.clone(jsonValue);
    } else {
      _value = jsonValue;
    }
    if (_value && this._isCollection(key)) {
      _value = new type(_value);
    } else if (_value && this._isModel(key)) {
      _value = new type(_value);
      _value._parent = this;
    } else if (typeOf(value) === 'date') {
      _value = Date.parse(_value);
    } else if (typeOf(value) === 'object' && value.constructor) {
      _value = new value.constructor(_value);
    } else if (typeOf(value) === 'array') {
      _value = _value.map(function(item, idx) {
        var orig;
        orig = value[0];
        if (typeOf(orig) === 'date') {
          return Date.parse(item);
        } else if (typeOf(orig) === 'object' && orig.constructor) {
          return new orig.constructor(item);
        } else {
          return item;
        }
      });
    }
    return _value;
  },
  _getDefault: function(key) {
    var def;
    def = this.defaults[key];
    if (typeOf(def) === 'function') {
      return def.call(this);
    } else {
      return def;
    }
  },
  _isSuccess: function(response) {
    return response.success === true;
  },
  _jsonKeyValue: function(key, value) {
    var jsonFn, v, _i, _len, _results;
    jsonFn = "json" + (key.capitalize());
    if (this[jsonFn] != null) {
      return this[jsonFn](value);
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
    if (value && instanceOf(value, Date)) {
      return value.format("%Y-%m-%dT%H:%M:%S.%L");
    } else if (value && typeOf(value.toJSON) === 'function') {
      return value.toJSON();
    } else {
      return value;
    }
  },
  _clearDirtyFields: function() {
    return this._dirtyFields = {};
  },
  isModel: true
});

return Model;

});;
