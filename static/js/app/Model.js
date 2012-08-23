(function() {

  define(['bags/Model'], function(Model) {
    return new Class({
      Extends: Model,
      url: '/page/'
    });
  });

}).call(this);
