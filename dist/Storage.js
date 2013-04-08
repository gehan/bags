define(['Q', './Events'], function(Q, Events){;
var Storage, _crudMap;

_crudMap = {
  create: 'post',
  read: 'get',
  update: 'put',
  "delete": 'delete'
};

Storage = new Class({
  Implements: [Events],
  storage: function(operation, data, options) {
    var deferred, fail, fireEvent, method, requestData,
      _this = this;

    if (options == null) {
      options = {};
    }
    deferred = Q.defer();
    method = _crudMap[operation];
    fail = function(reason) {
      if (reason == null) {
        reason = null;
      }
      deferred.reject(reason);
      return fireEvent("failure", [reason]);
    };
    fireEvent = function(event, args) {
      var eventName;

      eventName = "" + (options.eventName || operation) + (event.capitalize());
      if (!options.silent) {
        return _this.fireEvent(eventName, args);
      }
    };
    if (operation === 'read') {
      requestData = data;
    } else if (data != null) {
      requestData = {
        model: JSON.encode(data)
      };
    } else {
      requestData = {};
    }
    new Request.JSON({
      url: this._getUrl(operation),
      method: method,
      data: requestData,
      onRequest: function() {
        return fireEvent("start");
      },
      onComplete: function() {
        return fireEvent("complete");
      },
      onFailure: function(xhr) {
        return fail();
      },
      onSuccess: function(response) {
        var reason;

        if (_this.isSuccess(response)) {
          data = _this.parseResponse(response);
          deferred.resolve(data);
          return fireEvent("success", [data]);
        } else {
          reason = _this.parseFailResponse(response);
          return fail(reason);
        }
      }
    }).send();
    return deferred.promise;
  },
  isSuccess: function(response) {
    return response.success === true;
  },
  parseResponse: function(response) {
    return response.data;
  },
  parseFailResponse: function(response) {
    return response.error;
  },
  _getUrl: function(operation) {
    var url;

    url = this.url;
    if ((url == null) && (this.collection != null)) {
      url = this.collection.url;
    }
    if (url == null) {
      throw new Error("No url can be found");
    }
    if (this.isCollection) {
      return "" + url + "/";
    } else if (operation === 'update' || operation === 'delete' || operation === 'read') {
      if (this.id == null) {
        throw new Error("Model doesn't have an id, cannot perform\n" + operation);
      }
      return "" + url + "/" + this.id;
    } else {
      return url;
    }
  }
});

return Storage;

});
