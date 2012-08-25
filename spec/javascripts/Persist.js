(function() {
  var Persist, done, flatten;

  Persist = null;

  done = false;

  curl(['bags/Persist'], function(_Persist) {
    Persist = _Persist;
    return done = true;
  });

  flatten = function(obj) {
    return JSON.encode(obj);
  };

  describe("Persist test", function() {
    var p;
    p = null;
    beforeEach(function() {
      waitsFor(function() {
        return done;
      });
      return p = new Persist();
    });
    return it('is the internet', function() {
      return expect(true).toBe(true);
    });
  });

}).call(this);
