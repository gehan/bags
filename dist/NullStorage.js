(function() {
  define(['bags/Storage'], function(Storage){;

  var NullStorage;

  NullStorage = new Class({
    Extends: Storage,
    storage: function(operation, data, options) {
      var deferred;
      if (options == null) {
        options = {};
      }
      deferred = Q.defer();
      deferred.resolve({
        success: true
      });
      return deferred.promise;
    }
  });

  return NullStorage;

  });


}).call(this);
