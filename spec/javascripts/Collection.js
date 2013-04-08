define(['bags/Collection', 'bags/Model'], function(Collection, Model){;
var flatten;

flatten = function(obj) {
  return JSON.encode(obj);
};

describe("Collection test", function() {
  var col;

  col = null;
  beforeEach(function() {
    return col = new Collection();
  });
  it("listens to events on model and re-fires on collection", function() {
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
  it("separates sort and directioni ascending", function() {
    var descending, field, _ref;

    _ref = col._parseSort('hello'), field = _ref[0], descending = _ref[1];
    expect(field).toBe('hello');
    return expect(descending).toBe(false);
  });
  it("separates sort and direction descending", function() {
    var descending, field, _ref;

    _ref = col._parseSort('-hello'), field = _ref[0], descending = _ref[1];
    expect(field).toBe('hello');
    return expect(descending).toBe(true);
  });
  it('sorts collection on field, ascending', function() {
    var models;

    models = [
      {
        id: 1,
        text: 'c'
      }, {
        id: 2,
        text: 'a'
      }, {
        id: 3,
        text: 'b'
      }
    ];
    col = new Collection(models);
    col.sortBy('text');
    expect(col[0].get('text')).toBe('a');
    expect(col[1].get('text')).toBe('b');
    return expect(col[2].get('text')).toBe('c');
  });
  return it('sorts collection on field, descending', function() {
    var models;

    models = [
      {
        id: 1,
        text: 'c'
      }, {
        id: 2,
        text: 'a'
      }, {
        id: 3,
        text: 'b'
      }
    ];
    col = new Collection(models);
    col.sortBy('-text');
    expect(col[0].get('text')).toBe('c');
    expect(col[1].get('text')).toBe('b');
    return expect(col[2].get('text')).toBe('a');
  });
});

});
