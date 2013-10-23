define(function() {;
var BagsEvents, removeOn;

removeOn = function(string) {
  return string.replace(/^on([A-Z])/, function(full, first) {
    return first.toLowerCase();
  });
};

BagsEvents = new Class({
  Extends: Events,
  fireEvent: function(type, args, delay, dontFireAny) {
    var eventName;
    if (dontFireAny == null) {
      dontFireAny = false;
    }
    eventName = removeOn(type);
    if (this.$events['any'] && !dontFireAny && eventName !== 'any') {
      this.fireEvent('any', [eventName, args], delay, true);
    }
    return this.parent(type, args, delay);
  }
});

return BagsEvents;

});;
