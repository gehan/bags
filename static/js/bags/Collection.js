(function() {

  define(['bags/Model', 'bags/Storage'], function(Model, Storage) {
    return new Class({
      Extends: Array,
      Implements: [Options, Events, Storage],
      options: {},
      model: Model,
      url: null,
      initialize: function(models, options) {
        var model, _i, _len;
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
        this.setOptions(options);
        if (this.options.url != null) {
          this.url = this.options.url;
        }
        if (this.options.model != null) {
          this.model = this.options.model;
        }
        for (_i = 0, _len = models.length; _i < _len; _i++) {
          model = models[_i];
          this.add(model, {
            silent: true
          });
        }
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
        return promise.when(function(isSuccess, data) {
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
        var m, _i, _len, _results;
        if (options == null) {
          options = {};
        }
        if (!(this.model != null)) {
          throw new Error("Model not defined for collection");
        }
        if (typeOf(model) === 'array') {
          _results = [];
          for (_i = 0, _len = model.length; _i < _len; _i++) {
            m = model[_i];
            _results.push(this.add(m, options));
          }
          return _results;
        } else if (instanceOf(model, this.model)) {
          this._add(model);
          if (!(model.collection != null)) {
            model.collection = this;
          }
          if (!options.silent) {
            return this.fireEvent('add', [model]);
          }
        } else {
          return this.create(model, options);
        }
      },
      create: function(attributes, options) {
        var model;
        if (options == null) {
          options = {};
        }
        model = new this.model(attributes);
        return this.add(model, options);
      },
      get: function(field, value) {
        var obj;
        obj = null;
        if (this.some(function(obj) {
          return obj.get(field) === value;
        })) {
          return obj;
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
            return aVal.localeCompare(bVal);
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
      _add: function(model) {
        var _this = this;
        this.push(model);
        return model.addEvents({
          destroy: function() {
            _this.erase(model);
            return _this.fireEvent('remove', [model]);
          }
        });
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
