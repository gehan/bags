(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  define(['require', 'bags/Storage', 'bags/Exceptions'], function(require, Storage, Exceptions) {
    return new Class({
      Implements: [Events, Options, Storage],
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
        if (this.properties[key] && this.properties[key].get) {
          return this.properties[key].get.call(this);
        } else {
          return this._attributes[key];
        }
      }).overloadGetter(),
      set: function(key, value, options) {
        var attrs, k, v, _attrs, _results;
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
        } catch (error) {
          if (instanceOf(error, Exceptions.Validation)) {
            return false;
          }
        }
        _results = [];
        for (key in _attrs) {
          value = _attrs[key];
          if (this._isCollection(key, value)) {
            this._addCollection(key, value, options);
          }
          this._attributes[key] = value;
          if (key === this.idField) {
            this.id = value;
          }
          if (!options.silent) {
            this.fireEvent("change", [key, value]);
            _results.push(this.fireEvent("change:" + key, [value]));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      },
      _set: function(key, value, options) {
        var _value;
        if (this.properties[key] && (this.properties[key].set != null)) {
          return this.properties[key].set.call(this, value);
        } else {
          if (this._isCollection(key, value)) {
            _value = this._makeCollection(key, value);
          } else {
            _value = this._makeValue(key, value);
          }
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
        return !(this.id != null);
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
      fetch: function(options) {
        var promise, storageOptions,
          _this = this;
        if (options == null) {
          options = {};
        }
        if (this.isNew()) {
          return;
        }
        storageOptions = Object.merge({
          eventName: 'fetch'
        }, options);
        promise = this.storage('read', null, storageOptions);
        return promise.when(function(isSucess, data) {
          if (isSuccess) {
            _this.set(data, {
              silent: true
            });
            if (!options.silent) {
              return _this.fireEvent('fetch', [true]);
            }
          }
        });
      },
      save: function(key, value, options) {
        var ModelClass, attrs, data, promise, setAttrFn, storageMethod, storageOptions, toUpdate,
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
          toUpdate = new ModelClass(attrs);
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
        if (key != null) {
          setAttrFn = this.set.bind(this, key, value, options);
        }
        if (options.dontWait && (setAttrFn != null)) {
          setAttrFn();
        }
        storageMethod = this.isNew() ? "create" : "update";
        storageOptions = Object.merge({
          eventName: 'save'
        }, options);
        promise = this.storage(storageMethod, data, storageOptions);
        return promise.when(function(isSuccess, data) {
          var model;
          if (isSuccess) {
            if (!options.dontWait && (setAttrFn != null)) {
              setAttrFn();
            }
            model = data || {};
            if (_this.isNew()) {
              return _this.set(model, {
                silent: true
              });
            }
          }
        });
      },
      destroy: function(options) {
        var fireEvent, promise, storageOptions,
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
        storageOptions = Object.merge({
          eventName: 'destroy'
        }, options);
        promise = this.storage('delete', null, storageOptions);
        return promise.when(function(isSuccess, data) {
          if (isSuccess) {
            if (!options.dontWait) {
              return fireEvent();
            }
          }
        });
      },
      _attributes: {},
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
        } else if (type.prototype && type.prototype.isModel) {
          value = value || {};
          value._parent = this;
          return new type(value);
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
      _isCollection: function(key, value) {
        var type;
        type = this._getType(key);
        return (type != null) && type.prototype && type.prototype.isCollection;
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
        defaults = Object.map(Object.clone(this.defaults), function(value, key) {
          return _this._getDefault(key);
        });
        attrKeys = Object.keys(attributes);
        defaults = Object.filter(defaults, function(value, key) {
          return __indexOf.call(attrKeys, key) < 0;
        });
        Object.merge(attributes, defaults);
        return this.set(attributes, {
          silent: true
        });
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
        if (value && typeOf(value.toJSON) === 'function') {
          return value.toJSON();
        } else {
          return value;
        }
      },
      isModel: true
    });
  });

}).call(this);
