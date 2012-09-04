(function() {
  var Storage, done, flatten;

  Storage = null;

  done = false;

  curl(['bags/Storage'], function(_Storage) {
    Storage = _Storage;
    return done = true;
  });

  flatten = function(obj) {
    return JSON.encode(obj);
  };

  describe("Storage test", function() {
    var StorageClass, s;
    StorageClass = null;
    s = null;
    beforeEach(function() {
      waitsFor(function() {
        return done;
      });
      StorageClass = new Class({
        Implements: [Storage],
        url: '/items',
        fetch: function() {
          return this.storage('read', null, {
            eventName: 'fetch'
          });
        }
      });
      return s = new StorageClass();
    });
    it('tries to get url from module', function() {
      var url;
      url = s._getUrl('create');
      return expect(url).toBe('/items');
    });
    it('tries to get url from collection', function() {
      var url;
      s.url = null;
      s.collection = {
        url: '/collection'
      };
      url = s._getUrl('create');
      return expect(url).toBe('/collection');
    });
    it('throws error if no url found', function() {
      var errorThrown, url;
      errorThrown = false;
      s.url = null;
      try {
        url = s._getUrl('create');
      } catch (err) {
        errorThrown = true;
      }
      return expect(errorThrown).toBe(true);
    });
    it('adds /@id to other methods', function() {
      var url;
      s.id = 1;
      url = s._getUrl('delete');
      expect(url).toBe('/items/1');
      url = s._getUrl('read');
      expect(url).toBe('/items/1');
      url = s._getUrl('update');
      return expect(url).toBe('/items/1');
    });
    it('doesnt add /@id to read for collections', function() {
      var url;
      s.isCollection = true;
      url = s._getUrl('read');
      return expect(url).toBe('/items');
    });
    it('sets request methods correctly', function() {
      var req;
      s.id = 1;
      req = s.storage('read');
      expect(req.options.method).toBe('get');
      req = s.storage('create');
      expect(req.options.method).toBe('post');
      req = s.storage('delete');
      expect(req.options.method).toBe('delete');
      req = s.storage('update');
      return expect(req.options.method).toBe('put');
    });
    it('sends data across to server as json', function() {
      var model, req;
      model = {
        text: 'internet',
        date: '2012-01-01'
      };
      s.storage('create', model);
      req = mostRecentAjaxRequest();
      return expect(req.params).toBe(Object.toQueryString({
        model: JSON.encode(model)
      }));
    });
    it('parses response data correctly on success', function() {
      var lastCall, response;
      response = {
        status: 200,
        responseText: flatten({
          success: true,
          data: {
            id: 2
          }
        })
      };
      setNextResponse(response);
      spyOn(s, 'isSuccess').andCallThrough();
      spyOn(s, 'parseResponse').andCallThrough();
      s.isCollection = true;
      s.storage('read');
      expect(s.isSuccess).toHaveBeenCalled();
      lastCall = flatten(s.parseResponse.mostRecentCall.args[0]);
      return expect(lastCall).toBe(response.responseText);
    });
    it('executes success callback if passed through', function() {
      var lastCall, response, success;
      response = {
        status: 200,
        responseText: flatten({
          success: true,
          data: {
            id: 2
          }
        })
      };
      setNextResponse(response);
      success = jasmine.createSpy('succes cb');
      s.isCollection = true;
      s.storage('read', null, {
        success: success
      });
      lastCall = success.mostRecentCall.args[0];
      return expect(lastCall).toBeObject({
        id: 2
      });
    });
    it('executes failure callback if passed through', function() {
      var fail, response;
      response = {
        status: 200,
        responseText: flatten({
          success: false,
          error: 'its rubbish'
        })
      };
      setNextResponse(response);
      fail = jasmine.createSpy('fail cb');
      s.isCollection = true;
      s.storage('read', null, {
        failure: fail
      });
      return expect(fail).toHaveBeenCalledWith('its rubbish');
    });
    it('fires off events when request starts/completes/succeeds', function() {
      var completeSpy, readSpy, successSpy;
      setNextResponse({
        status: 200,
        responseText: flatten({
          success: true,
          data: {
            id: 2
          }
        })
      });
      readSpy = jasmine.createSpy('start spy');
      completeSpy = jasmine.createSpy('complete spy');
      successSpy = jasmine.createSpy('success spy');
      s.addEvent('readStart', readSpy);
      s.addEvent('readComplete', completeSpy);
      s.addEvent('readSuccess', successSpy);
      s.isCollection = true;
      s.storage('read');
      expect(readSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
      return expect(successSpy).toHaveBeenCalled();
    });
    it('fires off events when request fails', function() {
      var failSpy;
      setNextResponse({
        status: 404
      });
      failSpy = jasmine.createSpy('fail spy');
      s.addEvent('readFailure', failSpy);
      s.isCollection = true;
      s.storage('read');
      return expect(failSpy).toHaveBeenCalled();
    });
    it('fires off failure events with custom name', function() {
      var failSpy;
      setNextResponse({
        status: 404
      });
      failSpy = jasmine.createSpy('fail spy');
      s.isCollection = true;
      s.addEvent('fetchFailure', failSpy);
      s.fetch();
      return expect(failSpy).toHaveBeenCalled();
    });
    return it('sends qs data to read command', function() {
      var req;
      s.isCollection = true;
      s.storage('read', {
        page: 1,
        action: 'A'
      });
      req = mostRecentAjaxRequest();
      return expect(req.url).toBe('/items?page=1&action=A');
    });
  });

}).call(this);
