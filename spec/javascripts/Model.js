define(['Q', 'bags/Collection', 'bags/Model'], function(Q, Collection, Model){;describe("Model test", function() {
  var m;

  m = null;
  beforeEach(function() {
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
    return expect(m.get('key')).toBeObject(obj);
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
  it('fires change event only if attr has changed value', function() {
    var changeSpy;

    changeSpy = jasmine.createSpy('change');
    m = new Model({
      field: 'value'
    });
    m.addEvents({
      change: changeSpy
    });
    m.set({
      field: 'value'
    });
    return expect(changeSpy).wasNotCalled();
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
    window.f = mdl;
    return expect(subModel._parent).toBe(mdl);
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
    return expect(addedCollection.toJSON()).toBeObject(mdl.get('subCollection').toJSON());
  });
  it('sends create request to api', function() {
    var attrs, deferred, saved;

    attrs = {
      value1: 'key1',
      value2: 'key2'
    };
    m.set(attrs);
    expect(m.isNew()).toBe(true);
    deferred = Q.defer();
    spyOn(m, 'api').andReturn(deferred.promise);
    saved = false;
    m.save().then(function(ret) {
      return saved = true;
    });
    deferred.resolve({
      id: 2
    });
    waitsFor(function() {
      return saved === true;
    });
    return runs(function() {
      var lastCall;

      expect(saved).toBe(true);
      lastCall = m.api.mostRecentCall.args;
      expect(lastCall).toBeObject([
        'create', attrs, {
          eventName: 'save'
        }
      ]);
      return expect(m.id).toBe(2);
    });
  });
  it('sends update request to api', function() {
    var attrs, deferred, lastCall, promise2;

    attrs = {
      id: 2,
      value1: 'key1',
      value2: 'key2'
    };
    m.set(attrs);
    expect(m.isNew()).toBe(false);
    deferred = Q.defer();
    spyOn(m, 'api').andReturn(deferred.promise);
    promise2 = m.save();
    lastCall = m.api.mostRecentCall.args;
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
    var deferred, lastCall, promise2;

    m.set({
      id: 1
    });
    deferred = Q.defer();
    spyOn(m, 'api').andReturn(deferred.promise);
    promise2 = m.save({
      internet: 'yes'
    });
    lastCall = m.api.mostRecentCall.args;
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
    var deferred, success;

    success = jasmine.createSpy('success callback');
    deferred = Q.defer();
    spyOn(m, 'api').andReturn(deferred.promise);
    m.save().then(success);
    deferred.resolve({
      id: 3
    });
    waitsFor(function() {
      return success.wasCalled === true;
    });
    return runs(function() {
      var calledWith;

      expect(success).toHaveBeenCalled();
      calledWith = flatten(success.mostRecentCall.args);
      return expect(calledWith).toBe(flatten([
        {
          id: 3
        }
      ]));
    });
  });
  it('save accepts callback for failure', function() {
    var deferred, fail;

    fail = jasmine.createSpy('fail callback');
    deferred = Q.defer();
    spyOn(m, 'api').andReturn(deferred.promise);
    m.save().then((function() {}), fail);
    deferred.reject('shiit');
    waitsFor(function() {
      return fail.wasCalled === true;
    });
    return runs(function() {
      return expect(fail).toHaveBeenCalledWith('shiit');
    });
  });
  it('destroy send delete request to server', function() {
    var deferred, destroy, success;

    success = jasmine.createSpy('success callback');
    destroy = jasmine.createSpy('destroy event');
    m.id = 1;
    m.addEvent('destroy', destroy);
    deferred = Q.defer();
    spyOn(m, 'api').andReturn(deferred.promise);
    m.destroy().then(success);
    deferred.resolve('yeah mate');
    waitsFor(function() {
      return success.wasCalled === true;
    });
    return runs(function() {
      var lastCall;

      lastCall = m.api.mostRecentCall.args;
      expect(lastCall).toBeObject([
        'delete', null, {
          eventName: 'destroy'
        }
      ]);
      expect(success).toHaveBeenCalled();
      return expect(destroy).toHaveBeenCalled();
    });
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
  it('fires events when validator fails', function() {
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
  it('doesnt set any values if any field validations fail', function() {
    var result;

    m.fields = {
      collection: Collection
    };
    m.validators = {
      login: function(value) {
        if (value.length < 4) {
          return 'Login must be at least 4 characters';
        } else {
          return true;
        }
      }
    };
    expect(m.get('login')).toBe(void 0);
    expect(m.get('field1')).toBe(void 0);
    expect(m.get('field2')).toBe(void 0);
    expect(m.get('collection')).toBe(void 0);
    expect(m.collections.collection).toBe(void 0);
    result = m.set({
      login: 'int',
      field1: 'feck',
      field2: 'arse',
      collection: [
        {
          id: 1
        }, {
          id: 2
        }
      ]
    });
    expect(m.get('login')).toBe(void 0);
    expect(m.get('field1')).toBe(void 0);
    expect(m.get('field2')).toBe(void 0);
    expect(m.get('collection')).toBe(void 0);
    expect(m.collections.collection).toBe(void 0);
    return expect(result).toBe(false);
  });
  it('jsons dates with correct format, doesnt used own stupid internal method', function() {
    var json;

    m.fields = {
      date: Date
    };
    m.set({
      date: '2012-08-01 00:00:00'
    });
    json = m.toJSON();
    return expect(json.date).toBe("2012-08-01T00:00:00.000Z");
  });
  it('tracks if model is dirty or clean', function() {
    expect(m.isDirty()).toBe(false);
    m.set({
      name: 'mate'
    });
    return expect(m.isDirty()).toBe(true);
  });
  it('is clean when initialized', function() {
    m = new Model({
      name: 'internet',
      gear: true
    });
    return expect(m.isDirty()).toBe(false);
  });
  it('is clean after fetch', function() {
    var deferred, success;

    success = jasmine.createSpy();
    m = new Model({
      id: 1
    }, {
      url: '/items'
    });
    deferred = Q.defer();
    spyOn(m, 'api').andReturn(deferred.promise);
    deferred.resolve({
      id: 1,
      text: 'yeah'
    });
    m.fetch().then(success);
    return expect(m.isDirty()).toBe(false);
  });
  it('is clean after update', function() {
    var deferred, success;

    success = jasmine.createSpy();
    m = new Model({
      id: 1
    }, {
      url: '/items'
    });
    m.set({
      text: 'yeah mate'
    });
    expect(m.isDirty()).toBe(true);
    deferred = Q.defer();
    spyOn(m, 'api').andReturn(deferred.promise);
    m.save().then(success);
    deferred.resolve({
      id: 1
    });
    waitsFor(function() {
      return success.wasCalled === true;
    });
    return runs(function() {
      return expect(m.isDirty()).toBe(false);
    });
  });
  it('is clean after save', function() {
    var deferred, success;

    success = jasmine.createSpy();
    m = new Model({}, {
      url: '/items'
    });
    m.set({
      text: 'yeah mate'
    });
    expect(m.isDirty()).toBe(true);
    deferred = Q.defer();
    spyOn(m, 'api').andReturn(deferred.promise);
    m.save().then(success);
    deferred.resolve({
      id: 1
    });
    waitsFor(function() {
      return success.wasCalled === true;
    });
    return runs(function() {
      return expect(m.isDirty()).toBe(false);
    });
  });
  it('only sets original value in dirty field after first set', function() {
    m = new Model({
      text: 'original text'
    });
    m.set({
      text: 'altered text'
    });
    m.set({
      text: 'different again text'
    });
    return expect(m._dirtyFields.text).toBe('original text');
  });
  it('only dirty if field is set to different value', function() {
    m = new Model({
      text: 'original text'
    });
    m.set({
      text: 'original text'
    });
    return expect(m._dirtyFields.text).toBe(void 0);
  });
  it('no longer dirty once set back to original value', function() {
    m = new Model({
      text: 'original text'
    });
    m.set({
      text: 'new text'
    });
    expect(m._dirtyFields.text).toBe('original text');
    m.set({
      text: 'original text'
    });
    return expect(m._dirtyFields.text).toBe(void 0);
  });
  it('it can reset unsaved field changes', function() {
    m = new Model({
      id: 4,
      name: 'gehan',
      gear: true
    });
    m.set({
      name: 'fecker',
      gear: false
    });
    m.clearChanges();
    expect(m.get('name')).toBe('gehan');
    return expect(m.get('gear')).toBe(true);
  });
  it('resets objects too', function() {
    m = new Model({
      id: 4,
      myField: {
        someProperty: 'internet',
        someThing: 'webs'
      }
    });
    m.set('myField', {
      someProperty: 'webs',
      someThings: 'feck'
    });
    m.clearChanges();
    return expect(m.get('myField')).toBeObject({
      someProperty: 'internet',
      someThing: 'webs'
    });
  });
  it('provides dereferenced object on get, so updates dont affect model', function() {
    var val;

    m = new Model({
      id: 4,
      myField: {
        someProperty: 'internet',
        someThing: 'webs'
      }
    });
    val = m.get('myField');
    val.someThing = 'balls';
    return expect(m.get('myField').someThing).toBe('webs');
  });
  it('can create collection with Model.getCollection', function() {
    return expect(instanceOf(Model.getCollection(), Collection)).toBe(true);
  });
  it('accepts models as argument', function() {
    var col, models, options;

    models = [
      {
        id: 1,
        text: 'hello'
      }, {
        id: 3,
        text: 'internet'
      }
    ];
    options = {
      url: '/gehan/'
    };
    col = Model.getCollection(models, options);
    expect(col.length).toBe(2);
    expect(col[1].get('text')).toBe('internet');
    return expect(col.url).toBe('/gehan/');
  });
  it('when extending Model keeps Model.getCollection', function() {
    var ModelDef, col;

    ModelDef = new Class({
      Extends: Model,
      url: 'internet'
    });
    col = ModelDef.getCollection();
    expect(instanceOf(ModelDef.getCollection(), Collection)).toBe(true);
    return expect(col.url).toBe('internet');
  });
  it('allows overriding of Collection def in children', function() {
    var Collection2, ModelDef, col1, col2;

    Collection2 = new Class({
      Extends: Collection
    });
    ModelDef = new Class({
      Extends: Model,
      Collection: {
        "class": Collection2
      }
    });
    col1 = Model.getCollection();
    col2 = ModelDef.getCollection();
    expect(instanceOf(col1, Collection2)).toBe(false);
    return expect(instanceOf(col2, Collection2)).toBe(true);
  });
  it('implements extra methods specified in Collection, copies objects', function() {
    var ModelDef, col1, col2;

    ModelDef = new Class({
      Extends: Model,
      Collection: {
        "class": Collection,
        sortByField: 'yourMum',
        someObj: {
          value1: 'internet'
        }
      }
    });
    col1 = ModelDef.getCollection();
    col2 = ModelDef.getCollection();
    expect(col1.sortByField).toBe('yourMum');
    expect(col1.someObj.value1).toBe(col2.someObj.value1);
    col1.someObj.value1 = 'feck';
    return expect(col1.someObj.value1).toNotBe(col2.someObj.value1);
  });
  return it('overrides parent Collection methods but keeps others', function() {
    var Collection2, ModelDef, ModelDef2, col;

    Collection2 = new Class({
      Extends: Collection
    });
    ModelDef = new Class({
      Extends: Model,
      Collection: {
        "class": Collection2,
        internet: 'yes',
        sortByField: 'yourMum'
      }
    });
    ModelDef2 = new Class({
      Extends: ModelDef,
      Collection: {
        sortByField: 'yourDad'
      }
    });
    col = ModelDef2.getCollection();
    expect(instanceOf(col, Collection2)).toBe(true);
    expect(col.sortByField).toBe('yourDad');
    return expect(col.internet).toBe('yes');
  });
});

});
