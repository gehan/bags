define(['bags/Api'], function (Api) {;describe("Api test", function() {
  var ApiClass, s;

  ApiClass = null;
  s = null;
  beforeEach(function() {
    ApiClass = new Class({
      Implements: [Api],
      url: '/items',
      fetch: function(options) {
        var apiOptions;

        if (options == null) {
          options = {};
        }
        apiOptions = Object.merge({
          eventName: 'fetch'
        }, options);
        return this.api('read', null, apiOptions);
      }
    });
    return s = new ApiClass();
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
  it('gets request methods correctly', function() {
    expect(s._getRequestMethod('create')).toBe('post');
    expect(s._getRequestMethod('read')).toBe('get');
    expect(s._getRequestMethod('update')).toBe('put');
    expect(s._getRequestMethod('delete')).toBe('delete');
    expect(s._getRequestMethod('list')).toBe('get');
    return expect(s._getRequestMethod('archive')).toBe('post');
  });
  it('gets should jsons data correctly', function() {
    expect(s._sendDataAsJson('create')).toBe(true);
    expect(s._sendDataAsJson('read')).toBe(false);
    expect(s._sendDataAsJson('update')).toBe(true);
    expect(s._sendDataAsJson('delete')).toBe(false);
    expect(s._sendDataAsJson('list')).toBe(false);
    return expect(s._sendDataAsJson('archive')).toBe(false);
  });
  it('throws error if no url found', function() {
    var err, errorThrown, url;

    errorThrown = false;
    s.url = null;
    try {
      url = s._getUrl('create');
    } catch (_error) {
      err = _error;
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
  it('append operation name to url if unknown', function() {
    var url;

    s.id = 1;
    url = s._getUrl('archive');
    return expect(url).toBe('/items/1/archive');
  });
  it('doesnt add /@id to read for collections, adds /', function() {
    var url;

    s.isCollection = true;
    url = s._getUrl('read');
    return expect(url).toBe('/items/');
  });
  it('sends data across to server as json with correct content type', function() {
    var model, req;

    model = {
      text: 'internet',
      date: '2012-01-01'
    };
    s.api('create', model);
    req = mostRecentAjaxRequest();
    expect(req.requestHeaders['Content-type']).toBe('application/json');
    return expect(req.params).toBe(JSON.encode(model));
  });
  it('sends get/post as get/post, no override headers', function() {
    var request;

    s.api('read');
    request = mostRecentAjaxRequest();
    expect(request.method).toBe('GET');
    expect(request.requestHeaders['X-HTTP-Method-Override']).toBe(void 0);
    s.api('create');
    request = mostRecentAjaxRequest();
    expect(request.method).toBe('POST');
    return expect(request.requestHeaders['X-HTTP-Method-Override']).toBe(void 0);
  });
  it('sends other methods as post, with override headers', function() {
    var request;

    s.api('update');
    request = mostRecentAjaxRequest();
    expect(request.method).toBe('POST');
    expect(request.requestHeaders['X-HTTP-Method-Override']).toBe('PUT');
    s.api('delete');
    request = mostRecentAjaxRequest();
    expect(request.method).toBe('POST');
    return expect(request.requestHeaders['X-HTTP-Method-Override']).toBe('DELETE');
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
    s.api('read');
    expect(s.isSuccess).toHaveBeenCalled();
    lastCall = flatten(s.parseResponse.mostRecentCall.args[0]);
    return expect(lastCall).toBe(response.responseText);
  });
  it('executes success callback if passed through', function() {
    var promise, response, success;

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
    promise = s.api('read');
    promise.then(function(ret) {
      return success(ret);
    });
    waitsFor(function() {
      return success.wasCalled === true;
    });
    return runs(function() {
      var lastCall;

      lastCall = success.mostRecentCall.args[0];
      return expect(lastCall).toBeObject({
        id: 2
      });
    });
  });
  it('executes failure callback if passed through', function() {
    var fail, promise, response;

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
    promise = s.api('read');
    promise.then((function() {}), function(reason) {
      return fail(reason);
    });
    waitsFor(function() {
      return fail.wasCalled === true;
    });
    return runs(function() {
      return expect(fail).toHaveBeenCalledWith('its rubbish');
    });
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
    s.api('read');
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
    s.api('read');
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
  it('fires no events if silent passed in', function() {
    var failSpy;

    setNextResponse({
      status: 404
    });
    failSpy = jasmine.createSpy('fail spy');
    s.isCollection = true;
    s.addEvent('fetchFailure', failSpy);
    s.fetch({
      silent: true
    });
    return expect(failSpy).wasNotCalled();
  });
  return it('sends qs data to read command', function() {
    var req;

    s.isCollection = true;
    s.api('list', {
      page: 1,
      action: 'A'
    });
    req = mostRecentAjaxRequest();
    return expect(req.url).toBe('/items/?page=1&action=A');
  });
});

});
