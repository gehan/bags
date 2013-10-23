define(['Q', './Api'], function(Q, Storage){;
var NullApi;

NullApi = new Class({
  Extends: Api,
  api: function(operation, data, options) {
    var deferred;
    if (options == null) {
      options = {};
    }
    deferred = Q.defer();
    if (data && !data.id) {
      data.id = Math.floor(Math.random() * 100);
    }
    deferred.resolve(data);
    return deferred.promise;
  }
});

return NullApi;

});
