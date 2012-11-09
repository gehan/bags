(function() {
  var Model, View, done, flatten;

  View = null;

  Model = null;

  done = false;

  curl(['bags/View', 'bags/Model'], function(_View, _Model) {
    View = _View;
    Model = _Model;
    return done = true;
  });

  flatten = function(obj) {
    return JSON.encode(obj);
  };

  describe("View test", function() {
    var v;
    v = null;
    beforeEach(function() {
      waitsFor(function() {
        return done;
      });
      View.implement({
        template: 'test',
        TEMPLATES: {
          test: "<div ref='div'><p>yes</p></div>"
        }
      });
      return v = new View();
    });
    it('renders template on init', function() {
      var el;
      View.implement({
        template: 'test1',
        TEMPLATES: {
          test1: "<div>\n    <p>Hello</p>\n    <p>What</p>\n</div>"
        }
      });
      v = new View();
      el = $(v);
      return expect(el.innerHTML).toBe("<p>Hello</p><p>What</p>");
    });
    it('delegates events and saves refs on render', function() {
      var events;
      events = {
        "click:p": "someThing"
      };
      View.implement({
        events: events,
        template: 'test',
        TEMPLATES: {
          test: "<div ref='div'><p>yes</p></div>"
        }
      });
      v = new View();
      spyOn(v, 'delegateEvents');
      v.render();
      expect(v.delegateEvents).toHaveBeenCalledWith($(v), events);
      return expect(v.refs.div).toBe($(v));
    });
    it('injects element into container if passed in', function() {
      var container;
      container = new Element('div.container');
      v = new View({
        injectTo: container
      });
      return expect(container.getFirst()).toBe($(v));
    });
    it('replaces element reference when rendering again', function() {
      var container;
      container = new Element('div.container');
      v = new View({
        injectTo: container
      });
      v.render();
      return expect(container.getFirst()).toBe($(v));
    });
    it('replaces element reference when rendering again, array', function() {
      var container;
      container = new Element('div.container');
      View.implement({
        template: 'test3',
        TEMPLATES: {
          test3: "<div></div><div></div>"
        }
      });
      v = new View({
        injectTo: container
      });
      v.render();
      expect(container.getChildren()[0]).toBe($(v)[0]);
      return expect(container.getChildren()[1]).toBe($(v)[1]);
    });
    it('fires dom updated method if inserted into dom', function() {
      var container, elContainer;
      elContainer = null;
      document.addEvent('domupdated', function(_container) {
        return elContainer = _container;
      });
      container = new Element('div.container');
      v = new View({
        injectTo: container
      });
      expect(elContainer).toBe(null);
      document.body.adopt(container);
      v.render();
      expect(elContainer).toBe(container);
      return container.destroy();
    });
    it('partially rerenders and keeps existing refs', function() {
      var ano, ayes, hello, what;
      View.implement({
        template: 'test4',
        TEMPLATES: {
          test4: "<ul ref=\"what\">\n    <li ref=\"hello\">\n        {text}\n    </li>\n    <li ref=\"yes\">{text}</li>\n    <li ref=\"no\">No</li>\n</ul>"
        }
      });
      v = new View;
      v.render({
        text: 'internet'
      });
      expect($(v).innerHTML).toBe("<li ref=\"hello\">internet</li>" + "<li ref=\"yes\">internet</li><li ref=\"no\">No</li>");
      what = v.refs.what;
      hello = v.refs.hello;
      ayes = v.refs.yes;
      ano = v.refs.no;
      v.rerender(['hello', 'yes'], {
        text: 'interface'
      });
      expect(what).toBe(v.refs.what);
      expect(hello).toNotBe(v.refs.hello);
      expect(ayes).toNotBe(v.refs.yes);
      expect(ano).toBe(v.refs.no);
      return expect($(v).innerHTML).toBe("<li ref=\"hello\">interface</li>" + "<li ref=\"yes\">interface</li><li ref=\"no\">No</li>");
    });
    it('allows customer parse functions for display', function() {
      var data;
      v.parsers = {
        fullName: function(data) {
          return data.firstName + ' ' + data.lastName;
        }
      };
      v.data = {
        firstName: 'Gehan',
        lastName: 'Gonsalkorale'
      };
      data = v._getTemplateData();
      return expect(data.fullName).toBe('Gehan Gonsalkorale');
    });
    return it('does the binding friend', function() {
      var MyView;
      window.model = new Model({
        id: 5,
        name: 'gehan',
        feck: 'arse'
      });
      MyView = new Class({
        Extends: View,
        TEMPLATES: {
          tests: "<div>\n    <i data-bind=\"text: vm.id\"></i>: <span data-bind=\"text: vm.name\"></span>\n    <p data-bind=\"click: feck\">click here</p>\n</div>"
        },
        template: 'tests'
      });
      window.view = new MyView({
        model: model,
        useKnockout: true
      });
      view.inject(document.body);
      return expect(true).toBe(true);
    });
  });

}).call(this);
