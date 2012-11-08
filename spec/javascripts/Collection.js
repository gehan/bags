(function() {
  var Collection, Future, done, flatten;

  Collection = null;

  done = false;

  curl(['bags/Collection'], function(_Collection) {
    Collection = _Collection;
    return done = true;
  });

  Future = require('future');

  flatten = function(obj) {
    return JSON.encode(obj);
  };

  describe("Collection test", function() {
    var col;
    col = null;
    beforeEach(function() {
      waitsFor(function() {
        return done;
      });
      return col = new Collection();
    });
    return it("listens to events on model and re-fires on collection", function() {
      var model, modelSpy;
      modelSpy = jasmine.createSpy('modelEvent');
      col.addEvent('modelEvent', modelSpy);
      col.add({
        id: 12,
        text: 'arse'
      });
      model = col[0];
      model.fireEvent('modelEvent', 'yeah mate');
      return expect(modelSpy).toHaveBeenCalledWith(model, 'yeah mate');
    });
  });

}).call(this);
