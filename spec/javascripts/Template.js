define(['bags/Template'], function (Template) {;
describe("Template test", function() {
  var t,
    _this = this;
  t = null;
  beforeEach(function() {
    t = new Template();
    return t.TEMPLATES.base3 = "<div ref=\"refa\" class=\"refa\">\n    <p ref=\"ref1\" class=\"ref1\">Hello there {internet}</p>\n    <p ref=\"ref2\" class=\"ref2\">You are the face</p>\n</div>";
  });
  it('find templates in TEMPLATES collection', function() {
    var tpl;
    t.TEMPLATES.test = "internet1";
    tpl = t._getTemplate('test');
    return expect(tpl).toBe('internet1');
  });
  it('find templates in script tags', function() {
    var tag, tpl;
    expect(dust.cache.test1).toBe(void 0);
    tag = new Element('script', {
      template: 'test2',
      type: 'text/html'
    });
    tag.set('html', 'oh yeah hello');
    document.body.adopt(tag);
    tpl = t._getTemplate('test2');
    return expect(tpl).toBe('oh yeah hello');
  });
  it('renders a dust template', function() {
    var rendered;
    t.TEMPLATES.base1 = "<p>Hello there {internet}</p>";
    rendered = t._renderDustTemplate('base1', {
      internet: 'yes'
    });
    return expect(rendered).toBe('<p>Hello there yes</p>');
  });
  it('renders a template into elements', function() {
    var expected, nodes;
    t.TEMPLATES.base2 = "<div>\n    <p>Hello there {internet}</p>\n    <p>You are the face</p>\n</div>";
    nodes = t.renderTemplate('base2', {
      internet: 'yes'
    });
    expected = new Element('div').adopt(new Element('p', {
      text: 'Hello there yes'
    }), new Element('p', {
      text: 'You are the face'
    }));
    return expect(nodes.innerHTML).toBe(expected.innerHTML);
  });
  it('loads all templates to render partials', function() {
    var nodes, tag;
    t.TEMPLATES.base4 = "<div>\n    <p>Yeah</p>\n    {>somePartial/}\n</div>";
    tag = new Element('script', {
      template: 'somePartial',
      type: 'text/html'
    });
    tag.set('html', 'hello');
    document.body.adopt(tag);
    t.loadAllTemplates();
    nodes = t.renderTemplate('base4', {
      internet: 'yes'
    });
    return expect(nodes.innerHTML).toBe("<p>Yeah</p>hello");
  });
  it('extracts element references', function() {
    var nodes, refs;
    nodes = t.renderTemplate('base3', {
      internet: 'yes'
    });
    refs = t.getRefs(nodes);
    expect(refs.refa).toBe(nodes);
    expect(refs.ref1).toBe(nodes.getElement(".ref1"));
    return expect(refs.ref2).toBe(nodes.getElement(".ref2"));
  });
  it('extracts single reference', function() {
    var nodes, ref1, refa;
    nodes = t.renderTemplate('base3', {
      internet: 'yes'
    });
    refa = t.getRef(nodes, 'refa');
    ref1 = t.getRef(nodes, 'ref1');
    expect(refa).toBe(nodes);
    return expect(ref1).toBe(nodes.getElement(".ref1"));
  });
  return it('delegates events to children', function() {
    var el, events, fired, hello, hello1;
    events = {
      "click:p.hello": "hello",
      "click:.hello1": "hello1"
    };
    t.TEMPLATES.base5 = "<div>\n    <p class=\"hello\"></p>\n    <ul>\n        <li>What</li>\n        <li class=\"hello1\">Yeah<li>\n    </ul>\n</div>";
    fired = {};
    t.hello = function() {
      return fired.hello = true;
    };
    t.hello1 = function() {
      return fired.hello1 = true;
    };
    el = t.renderTemplate('base5');
    t.delegateEvents(el, events);
    hello = el.getElement(".hello");
    hello1 = el.getElement(".hello1");
    el.fireEvent('click', {
      target: hello
    });
    el.fireEvent('click', {
      target: hello1
    });
    expect(fired.hello).toBe(true);
    return expect(fired.hello1).toBe(true);
  });
});

});
