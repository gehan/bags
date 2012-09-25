(function() {
  var Collection, Future, Model, done, flatten;

  Model = null;

  Collection = null;

  done = false;

  curl(['bags/Model', 'bags/Collection'], function(_Model, _Collection) {
    window.Model = _Model;
    Model = _Model;
    Collection = _Collection;
    return done = true;
  });

  Future = require('future');

  flatten = function(obj) {
    return JSON.encode(obj);
  };

  describe("Model test", function() {
    var m;
    m = null;
    beforeEach(function() {
      waitsFor(function() {
        return done;
      });
      return m = new Model({}, {
        url: '/items'
      });
    });
    it('gets/sets attributes', function() {
      expect(m.has('test')).toBe(false);
      expect(m.get('test')).toBe(void 0);
      m.set('test', 'internet');
      expect(m.has('test')).toBe(true);
      return expect(m.get('test')).toBe('internet');
    });
    it('sets attributes silently', function() {
      var fired;
      fired = false;
      m.addEvent('change', function() {
        return fired = true;
      });
      m.set('more', 'fecker', {
        silent: true
      });
      return expect(fired).toBe(false);
    });
    it('sets multiple attributes', function() {
      m.set({
        test: 'internet2',
        more: 'fecker'
      });
      expect(m.get('test')).toBe('internet2');
      return expect(m.get('more')).toBe('fecker');
    });
    it('sets multiple attributes silently', function() {
      var fired;
      fired = false;
      m.addEvent('change', function() {
        return fired = true;
      });
      m.set({
        test: 'internet2',
        more: 'fecker'
      }, {
        silent: true
      });
      return expect(fired).toBe(false);
    });
    it('gets/sets attributes', function() {
      var obj;
      obj = {
        k: 'val'
      };
      m = new Model({
        key: obj
      });
      return expect(m.get('key')).toBe(obj);
    });
    it('fires change event on attr change', function() {
      var changed, changedAKey;
      changed = {};
      m.addEvent('change', function(key, value) {
        return changed[key] = value;
      });
      changedAKey = null;
      m.addEvent('change:aKey', function(value) {
        return changedAKey = value;
      });
      m.set({
        aKey: 'internet',
        bKey: 'test'
      });
      expect(changed.aKey).toBe('internet');
      expect(changedAKey).toBe('internet');
      return expect(changed.bKey).toBe('test');
    });
    it('sets defaults silently when initializing model', function() {
      var changeFired;
      Model.implement({
        defaults: {
          type: 'text',
          internet: 2,
          override: 'feck'
        }
      });
      changeFired = false;
      m = new Model({
        override: 'arse'
      }, {
        onChange: function() {
          return changeFired = true;
        }
      });
      expect(m.get('type')).toBe('text');
      expect(m.get('internet')).toBe(2);
      expect(m.get('override')).toBe('arse');
      expect(changeFired).toBe(false);
      Model.implement({
        defaults: null
      });
      return Model.implement({
        defaults: {}
      });
    });
    it('inits types correctly', function() {
      Model.implement({
        fields: {
          aDate: 'Date',
          aModel: function() {
            return Model;
          }
        }
      });
      m = new Model({
        aDate: '2012/01/01 02:02',
        aModel: {
          feck: 'arse'
        }
      });
      expect(instanceOf(m.get('aDate'), Date)).toBe(true);
      expect(m.get('aDate').format('%Y/%m/%d %H:%M')).toBe('2012/01/01 02:02');
      expect(instanceOf(m.get('aModel'), Model)).toBe(true);
      expect(m.get('aModel').get('feck')).toBe('arse');
      Model.implement({
        fields: null
      });
      return Model.implement({
        fields: {}
      });
    });
    it('inits type within arrays correctly', function() {
      Model.implement({
        fields: {
          aDate: 'Date'
        }
      });
      m = new Model({
        aDate: ['2012/01/01 02:02', '2012/01/01 02:03']
      });
      expect(m.get('aDate')[0].format('%Y/%m/%d %H:%M')).toBe('2012/01/01 02:02');
      expect(m.get('aDate')[1].format('%Y/%m/%d %H:%M')).toBe('2012/01/01 02:03');
      Model.implement({
        fields: null
      });
      return Model.implement({
        fields: {}
      });
    });
    it('sets id attribute when passed in', function() {
      m = new Model({
        id: 12
      });
      expect(m.get('id')).toBe(12);
      return expect(m.id).toBe(12);
    });
    it('sets custom id attribute when passed in', function() {
      Model.implement({
        idField: "_id"
      });
      m = new Model({
        _id: 12
      });
      expect(m.get('_id')).toBe(12);
      expect(m.id).toBe(12);
      return Model.implement({
        idField: "id"
      });
    });
    it('jsons basic key values', function() {
      var vals;
      vals = {
        key1: 'value1',
        key2: 'value2',
        key3: ['value3', 'value4']
      };
      m = new Model(vals);
      return expect(flatten(m.toJSON())).toBe(flatten(vals));
    });
    it('calls toJSON function on jsonable object', function() {
      var s, vals;
      s = {
        toJSON: function() {}
      };
      spyOn(s, 'toJSON').andReturn('value4');
      vals = {
        key1: 'value3',
        key2: s,
        key3: [s, s, s]
      };
      m = new Model(vals);
      return expect(flatten(m.toJSON())).toBe(flatten({
        key1: 'value3',
        key2: 'value4',
        key3: ['value4', 'value4', 'value4']
      }));
    });
    it('calls key-specific json methos on toJSON', function() {
      var Mdl, vals;
      Mdl = new Class({
        Extends: Model,
        jsonName: function(value) {
          return "json_" + value;
        }
      });
      vals = {
        key1: 'value1',
        name: 'value2'
      };
      m = new Mdl(vals);
      return expect(flatten(m.toJSON())).toBe(flatten({
        key1: 'value1',
        name: 'json_value2'
      }));
    });
    it('gives child model reference to itself', function() {
      var Mdl, mdl, subModel, vals;
      Mdl = new Class({
        Extends: Model,
        fields: {
          subModel: Model
        }
      });
      vals = {
        key1: 'value1',
        subModel: {
          key2: 'value2'
        }
      };
      mdl = new Mdl(vals);
      subModel = mdl.get('subModel');
      return expect(subModel.get('_parent')).toBe(mdl);
    });
    it('instantiates a collection if set as type, adds to collections', function() {
      var Cll, Mdl, addedCollection, addedKey, mdl, vals, values;
      Cll = new Class({
        Extends: Collection,
        model: Model
      });
      Mdl = new Class({
        Extends: Model,
        fields: {
          subCollection: Cll
        }
      });
      values = [
        {
          id: 1,
          key: 'value'
        }, {
          id: 2,
          key: 'value'
        }
      ];
      vals = {
        subCollection: values
      };
      addedKey = null;
      addedCollection = null;
      mdl = new Mdl(vals, {
        onAddCollection: function(key, collection) {
          addedKey = key;
          return addedCollection = collection;
        }
      });
      expect(instanceOf(mdl.collections.subCollection, Cll)).toBe(true);
      expect(instanceOf(mdl.get('subCollection'), Cll)).toBe(true);
      expect(flatten(mdl.get('subCollection').toJSON())).toBe(flatten(values));
      mdl.set('subCollection', values);
      expect(addedKey).toBe('subCollection');
      return expect(addedCollection).toBe(mdl.get('subCollection'));
    });
    it('sends create request to storage', function() {
      var attrs, lastCall, promise, promise2, saved;
      attrs = {
        value1: 'key1',
        value2: 'key2'
      };
      m.set(attrs);
      expect(m.isNew()).toBe(true);
      promise = new Future();
      spyOn(m, 'storage').andReturn(promise);
      saved = false;
      promise2 = m.save();
      promise2.when(function(isSuccess, ret) {
        if (isSuccess) {
          return saved = true;
        }
      });
      promise.fulfill(true, {
        id: 2
      });
      expect(saved).toBe(true);
      lastCall = m.storage.mostRecentCall.args;
      expect(lastCall).toBeObject([
        'create', attrs, {
          eventName: 'save'
        }
      ]);
      return expect(m.id).toBe(2);
    });
    it('sends update request to storage', function() {
      var attrs, lastCall, promise, promise2;
      attrs = {
        id: 2,
        value1: 'key1',
        value2: 'key2'
      };
      m.set(attrs);
      expect(m.isNew()).toBe(false);
      promise = new Future();
      spyOn(m, 'storage').andReturn(promise);
      promise2 = m.save();
      lastCall = m.storage.mostRecentCall.args;
      return expect(lastCall).toBeObject([
        'update', attrs, {
          eventName: 'save'
        }
      ]);
    });
    it('save accepts values, doesnt update until server response', function() {
      var changeCalledBeforeSave, req, requestData, saveCompleted;
      m.set('action', 'face');
      setNextResponse({
        status: 200,
        responseText: flatten({
          success: true
        })
      });
      saveCompleted = false;
      changeCalledBeforeSave = false;
      m.addEvent('saveComplete', function() {
        return saveCompleted = true;
      });
      m.addEvent('change', function() {
        if (!saveCompleted) {
          return changeCalledBeforeSave = true;
        }
      });
      m.save('action', 'deleted');
      req = mostRecentAjaxRequest();
      requestData = {
        model: JSON.encode({
          action: 'deleted'
        })
      };
      expect(req.params).toBe(Object.toQueryString(requestData));
      return expect(changeCalledBeforeSave).toBe(false);
    });
    it('save accepts values, updates immediately if requested', function() {
      var changeCalled;
      changeCalled = false;
      m.addEvent('change', function(key, value) {
        return changeCalled = key === 'internet' && value === 'face';
      });
      setNextResponse({
        status: 200,
        responseText: flatten({
          success: true
        })
      });
      m.save('internet', 'face', {
        dontWait: true
      });
      return expect(changeCalled).toBe(true);
    });
    it('save accepts values, but keeps id if existing model', function() {
      var lastCall, promise, promise2;
      m.set({
        id: 1
      });
      promise = new Future();
      spyOn(m, 'storage').andReturn(promise);
      promise2 = m.save({
        internet: 'yes'
      });
      lastCall = m.storage.mostRecentCall.args;
      return expect(lastCall).toBeObject([
        'update', {
          id: 1,
          internet: 'yes'
        }, {
          eventName: 'save'
        }
      ]);
    });
    it('save accepts value obj', function() {
      var req, requestData;
      m.set('action', 'face');
      m.save({
        action: 'deleted',
        feck: 'arse'
      });
      req = mostRecentAjaxRequest();
      requestData = {
        model: JSON.encode({
          action: 'deleted',
          feck: 'arse'
        })
      };
      return expect(req.params).toBe(Object.toQueryString(requestData));
    });
    it('save works with types', function() {
      var Mdl, changeCalled, dte, req, requestData;
      Mdl = new Class({
        Implements: Model,
        url: '/items',
        fields: {
          aDate: Date
        }
      });
      m = new Mdl;
      changeCalled = false;
      m.addEvent('change', function() {
        return changeCalled = true;
      });
      dte = new Date('2012-01-01');
      m.save({
        aDate: dte
      });
      req = mostRecentAjaxRequest();
      requestData = {
        model: JSON.encode({
          aDate: dte.toJSON()
        })
      };
      expect(req.params).toBe(Object.toQueryString(requestData));
      return expect(changeCalled).toBe(false);
    });
    it('save accepts callback for success', function() {
      var calledWith, promise, promise2, success;
      success = jasmine.createSpy('success callback');
      promise = new Future();
      spyOn(m, 'storage').andReturn(promise);
      promise2 = m.save();
      promise2.when(function(isSuccess, data) {
        if (isSuccess) {
          return success(data);
        }
      });
      promise.fulfill(true, {
        id: 3
      });
      expect(success).toHaveBeenCalled();
      calledWith = flatten(success.mostRecentCall.args);
      return expect(calledWith).toBe(flatten([
        {
          id: 3
        }
      ]));
    });
    it('save accepts callback for failure', function() {
      var fail, promise, promise2;
      fail = jasmine.createSpy('fail callback');
      promise = new Future();
      spyOn(m, 'storage').andReturn(promise);
      m.save();
      promise2 = m.save();
      promise2.when(function(isSuccess, data) {
        if (!isSuccess) {
          return fail(data);
        }
      });
      promise.fulfill(false);
      return expect(fail).toHaveBeenCalled();
    });
    it('destroy send delete request to server', function() {
      var destroy, lastCall, promise, promise2, success;
      success = jasmine.createSpy('success callback');
      destroy = jasmine.createSpy('destroy event');
      m.id = 1;
      m.addEvent('destroy', destroy);
      promise = new Future();
      spyOn(m, 'storage').andReturn(promise);
      promise2 = m.destroy();
      promise2.when(function(isSuccess) {
        if (isSuccess) {
          return success();
        }
      });
      promise2.fulfill(true);
      lastCall = m.storage.mostRecentCall.args;
      expect(lastCall).toBeObject([
        'delete', null, {
          eventName: 'destroy'
        }
      ]);
      expect(success).toHaveBeenCalled();
      return expect(destroy).toHaveBeenCalled();
    });
    it('allows custom get methods', function() {
      m.properties = {
        fullName: {
          get: function() {
            return "" + (this.get('firstName')) + " " + (this.get('lastName'));
          }
        }
      };
      m.set({
        firstName: 'Gehan',
        lastName: 'Gonsalkorale'
      });
      return expect(m.get('fullName')).toBe('Gehan Gonsalkorale');
    });
    it('allows custom set methods', function() {
      m.properties = {
        fullName: {
          set: function(value) {
            var split;
            split = value.split(" ");
            return this.set({
              firstName: split[0],
              lastName: split[1]
            }, {
              silent: true
            });
          }
        }
      };
      m.set({
        fullName: 'Gehan Gonsalkorale'
      });
      expect(m.get('firstName')).toBe('Gehan');
      return expect(m.get('lastName')).toBe('Gonsalkorale');
    });
    it('sets when validator passes', function() {
      m.validators = {
        login: function(value) {
          if (value.length < 4) {
            return 'Login must be at least 4 characters';
          } else {
            return true;
          }
        }
      };
      m.set('login', 'fecker');
      return expect(m.get('login')).toBe('fecker');
    });
    it('rejects set when validator fails', function() {
      m.validators = {
        login: function(value) {
          if (value.length < 4) {
            return 'Login must be at least 4 characters';
          } else {
            return true;
          }
        }
      };
      m.set('login', 'fec');
      return expect(m.get('login')).toBe(void 0);
    });
    return it('fires events when validator fails', function() {
      var errorLoginSpy, errorSpy;
      m.validators = {
        login: function(value) {
          if (value.length < 4) {
            return 'Login must be at least 4 characters';
          } else {
            return true;
          }
        }
      };
      errorSpy = jasmine.createSpy('errorSpy');
      errorLoginSpy = jasmine.createSpy('errorLoginSpy');
      m.addEvents({
        error: errorSpy,
        'error:login': errorLoginSpy
      });
      m.set('login', 'fec');
      expect(errorLoginSpy).toHaveBeenCalledWith('fec', 'Login must be at least 4 characters');
      return expect(errorSpy).toHaveBeenCalledWith('login', 'fec', 'Login must be at least 4 characters');
    });
  });

}).call(this);
