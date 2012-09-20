(function() {
  var Collection, View, Views, done, flatten;

  Views = null;

  View = null;

  Collection = null;

  done = false;

  curl(['bags/Views', 'bags/View', 'bags/Collection'], function(_Views, _View, _Collection) {
    Views = _Views;
    View = _View;
    Collection = _Collection;
    return done = true;
  });

  flatten = function(obj) {
    return JSON.encode(obj);
  };

  describe("ViewCollection test", function() {
    var View2, c, cv, listEl, v;
    cv = null;
    c = null;
    v = null;
    View = null;
    View2 = null;
    listEl = null;
    beforeEach(function() {
      waitsFor(function() {
        return done;
      });
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
      c = new Collection([
        {
          id: 1,
          name: 'item a'
        }, {
          id: 2,
          name: 'item d'
        }, {
          id: 3,
          name: 'item c'
        }
      ]);
      c.sortField = 'name';
      return listEl = new Element('ul');
    });
    afterEach(function() {
      return listEl.destroy();
    });
    it('renders views into collection el', function() {
      var children, views;
      c.sortField = null;
      cv = new Views.CollectionView(c, listEl, View2);
      children = listEl.getChildren();
      views = children.retrieve('view');
      expect(views.length).toBe(3);
      expect(views[0].model.id).toBe(1);
      expect(views[1].model.id).toBe(2);
      return expect(views[2].model.id).toBe(3);
    });
    it('renders views into collection el sorted if has sortField', function() {
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
    return it('kills els on destroy', function() {
      var children, views;
      cv.destroy();
      children = listEl.getChildren();
      views = children.retrieve('view');
      return expect(children.length).toBe(0);
    });
  });

}).call(this);
