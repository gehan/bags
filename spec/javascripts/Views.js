define(['bags/Views', 'bags/View', 'bags/Collection'],
function(Views, View, Collection) {;
var flatten;

flatten = function(obj) {
  return JSON.encode(obj);
};

describe("ViewCollection test", function() {
  var EmptyView, View2, c, cv, listEl, v;

  cv = null;
  c = null;
  v = null;
  View2 = null;
  EmptyView = null;
  listEl = null;
  beforeEach(function() {
    dust.cache = {};
    View2 = new Class({
      Extends: View,
      TEMPLATES: {
        test: "<li>{name}</li>"
      },
      template: 'test',
      initialize: function() {
        var ret,
          _this = this;

        ret = this.parent.apply(this, arguments);
        this.model.addEvent('change', function() {
          return _this.render();
        });
        return ret;
      }
    });
    EmptyView = new Class({
      Extends: View,
      TEMPLATES: {
        empty: "<li>I'm empty</li>",
        empty2: "<li>I'm empty too</li>"
      },
      template: 'empty'
    });
    c = new Collection([
      {
        id: 1,
        name: 'item a'
      }, {
        id: 2,
        name: 'item z'
      }, {
        id: 3,
        name: 'item c'
      }
    ], {
      sortField: 'name'
    });
    return listEl = new Element('ul');
  });
  afterEach(function() {
    return listEl.destroy();
  });
  it('renders views into collection el', function() {
    var children, views;

    cv = new Views.CollectionView(c, listEl, View2);
    children = listEl.getChildren();
    views = children.retrieve('view');
    expect(views[0].model.id).toBe(1);
    expect(views[1].model.id).toBe(3);
    return expect(views[2].model.id).toBe(2);
  });
  it('adds new element into list in order', function() {
    var children, views;

    cv = new Views.CollectionView(c, listEl, View2);
    c.create({
      id: 4,
      name: 'item b'
    });
    children = listEl.getChildren();
    views = children.retrieve('view');
    return expect(views[1].model.id).toBe(4);
  });
  it('maintains order after model view render, e.g. save', function() {
    var children, id, model, view, views;

    cv = new Views.CollectionView(c, listEl, View2);
    children = listEl.getChildren();
    views = children.retrieve('view');
    view = views[2];
    model = view.model;
    id = model.id;
    model.set({
      name: 'a top of list'
    });
    children = listEl.getChildren();
    views = children.retrieve('view');
    return expect(views[0].model.id).toBe(id);
  });
  it('removes all collection events on destroy', function() {
    cv = new Views.CollectionView(c, listEl, View2);
    cv.destroy();
    return c.create({
      id: 4,
      name: 'item b'
    });
  });
  it('kills els on destroy', function() {
    var children, views;

    cv.destroy();
    children = listEl.getChildren();
    views = children.retrieve('view');
    return expect(children.length).toBe(0);
  });
  it('resorts collection on element render', function() {
    var children, m, views;

    cv = new Views.CollectionView(c, listEl, View2);
    children = listEl.getChildren();
    views = children.retrieve('view');
    expect(views[0].model.id).toBe(1);
    expect(views[1].model.id).toBe(3);
    expect(views[2].model.id).toBe(2);
    m = views[2].model;
    m.set('name', 'am first');
    views[2].render();
    children = listEl.getChildren();
    views = children.retrieve('view');
    expect(views[0].model.id).toBe(2);
    expect(views[1].model.id).toBe(1);
    return expect(views[2].model.id).toBe(3);
  });
  return it('shows emptyviewitem if collection empty', function() {
    var model;

    listEl = new Element('ul');
    c = new Collection([
      {
        id: 1,
        name: 'feck'
      }
    ]);
    cv = new Views.CollectionView(c, listEl, View2, {
      itemEmptyView: EmptyView
    });
    listEl.inject(document.body);
    expect(listEl.getChildren().length).toBe(1);
    expect(listEl.getChildren()[0].get('text')).toBe('feck');
    model = c[0];
    c._remove(model);
    expect(listEl.getChildren().length).toBe(1);
    expect(listEl.getChildren()[0].get('text')).toBe("I'm empty");
    c.create({
      id: 2,
      name: 'internet'
    });
    expect(listEl.getChildren().length).toBe(1);
    return expect(listEl.getChildren()[0].get('text')).toBe('internet');
  });
});

});
