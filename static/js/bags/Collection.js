(function() {

  define(['bags/Model'], function(Model) {
    return new Class({
      Extends: Array,
      Implements: [Options, Events],
      _models: [],
      model: Model,
      options: {},
      url: null,
      initialize: function(models, options) {
        var model, _i, _len;
        if (models == null) {
          models = [];
        }
        if (options == null) {
          options = {};
        }
        if (options.url != null) {
          this.url = options.url;
        }
        if (options.model != null) {
          this.model = options.model;
        }
        this.setOptions(options);
        for (_i = 0, _len = models.length; _i < _len; _i++) {
          model = models[_i];
          this.add(model, {
            silent: true
          });
        }
        return this;
      },
      add: function(model, options) {
        var m, _i, _len, _results;
        if (options == null) {
          options = {
            silent: false
          };
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
      _add: function(model) {
        return this.push(model);
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
      _remove: function(model, options) {
        this.erase(model);
        if (!options.silent) {
          return this.fireEvent('remove', [model]);
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
      fetch: function(options) {
        var _this = this;
        if (options == null) {
          options = {};
        }
        if (this.request != null) {
          this.request.cancel();
        }
        return this.request = new Request.JSON({
          url: options.url || this.url,
          method: 'get',
          onSuccess: function(response) {
            return _this._fetchDone(response, options);
          }
        }).send();
      },
      _fetchDone: function(response, options) {
        var models;
        if (options == null) {
          options = {};
        }
        models = this.parseResponse(response);
        if (options.add) {
          this.add(models, options);
        } else {
          this.reset(models, options);
        }
        return this.fireEvent('fetch', [true]);
      },
      sort: function(comparator) {
        if (comparator == null) {
          comparator = this.comparator;
        }
        this.parent(comparator);
        return this.fireEvent('sort', this);
      },
      comparator: function(a, b) {
        return a - b;
      },
      parseResponse: function(response) {
        return response;
      },
      toJSON: function() {
        return this.invoke('toJSON');
      }
    });
  });

}).call(this);
