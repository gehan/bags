(function() {
  var BagsEvents, Future, done, flatten;

  BagsEvents = null;

  done = false;

  curl(['bags/Events'], function(_Events) {
    BagsEvents = _Events;
    return done = true;
  });

  Future = require('future');

  flatten = function(obj) {
    return JSON.encode(obj);
  };

  describe("Events test", function() {
    var ev;
    ev = null;
    beforeEach(function() {
      waitsFor(function() {
        return done;
      });
      return ev = new BagsEvents();
    });
    it("provides 'any' event which is fired whenever any event is fired", function() {
      var anySpy, otherSpy;
      anySpy = jasmine.createSpy('anyEvent');
      otherSpy = jasmine.createSpy('anyEvent');
      ev.addEvent('any', anySpy);
      ev.addEvent('balls', otherSpy);
      ev.fireEvent('balls', 'what');
      expect(anySpy).toHaveBeenCalledWith('balls', 'what');
      return expect(otherSpy).toHaveBeenCalledWith('what');
    });
    return it("if 'any' event fired directly then only fires it once", function() {
      var anySpy;
      anySpy = jasmine.createSpy('anyEvent');
      ev.addEvent('any', anySpy);
      ev.fireEvent('any');
      return expect(anySpy.calls.length).toBe(1);
    });
  });

}).call(this);
