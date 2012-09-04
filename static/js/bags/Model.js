(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  define(['require', 'bags/Storage'], function(require, Storage) {
    var Model;
    return Model = new Class({
      Implements: [Events, Options, Storage],
      fields: {},
      defaults: {},
      id: null,
      idField: "id",
      collections: {},
      initialize: function(attributes, options) {
        if (options == null) {
          options = {};
        }
        if (options.url != null) {
          this.url = options.url;
        }
        if (options.collection != null) {
          this.collection = options.collection;
        }
        this.setOptions(options);
        this._setInitial(attributes);
        return this;
      },
      has: function(key) {
        return this._attributes[key] != null;
      },
      get: function(key) {
        return this._attributes[key];
      },
      set: function(key, value, options) {
        var attrs, k, opts, v;
        if (options == null) {
          options = {
            silent: false
          };
        }
        if (typeOf(key) === 'object') {
          attrs = key;
          opts = value || options;
          for (k in attrs) {
            v = attrs[k];
            this.set(k, v, opts);
          }
          return;
        } else if (this._isCollection(key, value)) {
          this._attributes[key] = this._addCollection(key, value);
        } else {
          this._attributes[key] = this._makeValue(key, value);
          if (key === this.idField) {
            this.id = value;
          }
        }
        if (!options.silent) {
          this.fireEvent("change", [key, value]);
          return this.fireEvent("change:" + key, [value]);
        }
      },
      fetch: function(options) {
        var promise,
          _this = this;
        if (options == null) {
          options = {};
        }
        if (this.isNew()) {
          return;
        }
        promise = this.storage('read', null, {
          eventName: 'fetch'
        });
        return promise.when(function(isSucess, data) {
          if (isSuccess) {
            _this.set(data, {
              silent: true
            });
            return _this.fireEvent('fetch', [true]);
          }
        });
      },
      save: function(key, value, options) {
        var ModelClass, attrs, data, promise, setAttrFn, toUpdate,
          _this = this;
        if (options == null) {
          options = {
            dontWait: false,
            silent: false
          };
        }
        ModelClass = this.$constructor;
        if (key != null) {
          attrs = {};
          if (!(this.isNew() != null)) {
            attrs[this.idField] = this.id;
          }
          toUpdate = new ModelClass;
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
        promise = this.storage((this.isNew() ? "create" : "update"), data, {
          eventName: 'save'
        });
        return promise.when(function(isSuccess, data) {
          var model;
          if (isSuccess) {
            if (!options.dontWait && (setAttrFn != null)) {
              setAttrFn();
            }
            model = data || {};
            return _this.set(model, {
              silent: true
            });
          }
        });
      },
      isNew: function() {
        return !(this.id != null);
      },
      destroy: function(options) {
        var promise,
          _this = this;
        if (options == null) {
          options = {
            dontWait: false
          };
        }
        if (this.isNew()) {
          this.fireEvent('destroy');
          return;
        }
        if (options.dontWait) {
          this.fireEvent('destroy');
        }
        promise = this.storage('delete', null, {
          eventName: 'destroy'
        });
        return promise.when(function(isSuccess, data) {
          if (isSuccess) {
            if (!options.dontWait) {
              return _this.fireEvent('destroy');
            }
          }
        });
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
        } else if (instanceOf(new type(), Model)) {
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
        var Collection, type;
        try {
          Collection = require('bags/Collection');
        } catch (error) {
          return false;
        }
        type = this._getType(key);
        return (type != null) && typeOf(value) === 'array' && instanceOf(new type(), Collection);
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
      }
    });
  });

}).call(this);
