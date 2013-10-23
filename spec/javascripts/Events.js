define(['bags/Events'], function(BagsEvents){;
describe("Events test", function() {
  var ev;
  ev = null;
  beforeEach(function() {
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

});
