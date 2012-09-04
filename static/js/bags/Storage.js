(function() {

  define(function() {
    return new Class({
      Implements: [Events],
      storage: function(operation, data, options) {
        var fail, fireEvent, method, requestData,
          _this = this;
        if (options == null) {
          options = {};
        }
        method = this._crudMap[operation];
        fail = function(reason) {
          if (reason == null) {
            reason = null;
          }
          if (options.failure != null) {
            options.failure(reason);
          }
          return fireEvent("failure", [reason]);
        };
        fireEvent = function(event, args) {
          var eventName;
          eventName = "" + (options.eventName || operation) + (event.capitalize());
          return _this.fireEvent(eventName, args);
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
        return new Request.JSON({
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
              if (options.success != null) {
                options.success(data);
              }
              return fireEvent("success", [data]);
            } else {
              reason = _this.parseFailResponse(response);
              return fail(reason);
            }
          }
        }).send();
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
      _crudMap: {
        read: 'get',
        create: 'post',
        update: 'put',
        "delete": 'delete'
      },
      _getUrl: function(operation) {
        var url;
        url = this.url;
        if (!(url != null) && (this.collection != null)) {
          url = this.collection.url;
        }
        if (!(url != null)) {
          throw new Error("No url can be found");
        }
        if ((operation === 'update' || operation === 'delete') || (operation === 'read' && !this.isCollection)) {
          if (!(this.id != null)) {
            throw new Error("Model doesn't have an id, cannot perform " + operation);
          }
          return "" + url + "/" + this.id;
        } else {
          return url;
        }
      }
    });
  });

}).call(this);
