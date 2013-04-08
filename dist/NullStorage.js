define(['Q', './Storage'], function(Q, Storage){;
var NullStorage;

NullStorage = new Class({
  Extends: Storage,
  storage: function(operation, data, options) {
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

return NullStorage;

});
