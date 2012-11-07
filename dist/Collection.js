(function() {

  define(['require', 'bags/Storage'], function(require, Storage) {
    return new Class({
      Extends: Array,
      Implements: [Options, Events, Storage],
      options: {},
      url: null,
      initialize: function(models, options) {
        var key, _i, _len, _ref;
        if (models == null) {
          models = [];
        }
        if (options == null) {
          options = {};
        }
        if (options.parentModel != null) {
          this.parentModel = {
            id: options.parentModel.id,
            klass: options.parentModel.constructor
          };
          delete options.parentModel;
        }
        _ref = ['model', 'url', 'sortField'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          key = _ref[_i];
          if (options[key] != null) {
            this[key] = options[key];
            delete options[key];
          }
        }
        this.setOptions(options);
        if (!this.model) {
          this.model = require('bags/Model');
        }
        this.add(models, {
          silent: true
        });
        return this;
      },
      fetch: function(filter, options) {
        var promise,
          _this = this;
        if (filter == null) {
          filter = {};
        }
        if (options == null) {
          options = {};
        }
        promise = this.storage('read', filter);
        return promise.when(function(isSuccess, models) {
          if (isSuccess) {
            if (options.add) {
              _this.add(models, options);
            } else {
              _this.reset(models, options);
            }
            if (!options.silent) {
              return _this.fireEvent('fetch', [true]);
            }
          }
        });
      },
      reset: function(models, options) {
        var model;
        if (options == null) {
          options = {};
        }
        while (model = this.pop()) {
          this._remove(model, options);
        }
        if (models != null) {
          this.add(models, {
            silent: true
          });
        }
        if (!options.silent) {
          return this.fireEvent('reset', [this]);
        }
      },
      add: function(model, options) {
        var added, m, _i, _j, _len, _len1, _ref, _results;
        if (options == null) {
          options = {};
        }
        if (!(this.model != null)) {
          throw new Error("Model not defined for collection");
        }
        if (typeOf(model) === 'array') {
          for (_i = 0, _len = model.length; _i < _len; _i++) {
            m = model[_i];
            added = this._add(m, options);
          }
        } else {
          added = this._add(model, options);
        }
        if (this.sortField != null) {
          this.sortBy(this.sortField, {
            silent: true
          });
        }
        if (!options.silent) {
          _ref = Array.from(added);
          _results = [];
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            model = _ref[_j];
            _results.push(this.fireEvent('add', [model]));
          }
          return _results;
        }
      },
      _add: function(model, options) {
        if (options == null) {
          options = {};
        }
        model = this._makeModel(model);
        this.push(model);
        return model;
      },
      create: function(attributes, options) {
        var model;
        if (options == null) {
          options = {};
        }
        model = this._makeModel(attributes);
        return this.add(model, options);
      },
      get: function(field, value) {
        var obj, _i, _len;
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          obj = this[_i];
          if (obj.get(field) === value) {
            return obj;
          }
        }
      },
      sort: function(comparator, options) {
        if (comparator == null) {
          comparator = this.comparator;
        }
        if (options == null) {
          options = {};
        }
        this.parent(comparator);
        if (!options.silent) {
          return this.fireEvent('sort');
        }
      },
      sortBy: function(field, options) {
        return this.sort(function(a, b) {
          var aVal, bVal, type;
          aVal = a.get(field);
          bVal = b.get(field);
          type = typeOf(aVal);
          if (type === 'number') {
            return aVal - bVal;
          } else if (type === 'string') {
            return aVal.toLowerCase().localeCompare(bVal.toLowerCase());
          } else if (type === 'date') {
            return bVal.diff(aVal, 'ms');
          }
        }, options);
      },
      sortField: null,
      comparator: function(a, b) {
        return a - b;
      },
      toJSON: function() {
        return this.invoke('toJSON');
      },
      _makeModel: function(model) {
        var _this = this;
        if (!instanceOf(model, this.model)) {
          model = new this.model(model, {
            collection: this
          });
        } else if (!(model.collection != null)) {
          model.collection = this;
        }
        model.addEvents({
          destroy: function() {
            _this.erase(model);
            return _this.fireEvent('remove', [model]);
          }
        });
        return model;
      },
      _remove: function(model, options) {
        if (options == null) {
          options = {};
        }
        model.removeEvents('destroy');
        this.erase(model);
        if (!options.silent) {
          return this.fireEvent('remove', [model]);
        }
      },
      isCollection: true
    });
  });

}).call(this);
