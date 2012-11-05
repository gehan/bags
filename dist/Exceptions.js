(function() {

  define(function() {
    return {
      Validation: new Class({
        initialize: function(field, value, message) {
          this.field = field;
          this.value = value;
          this.message = message;
        }
      })
    };
  });

}).call(this);
