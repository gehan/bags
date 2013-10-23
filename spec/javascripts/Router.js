define(['bags/Router', 'bags/View'], function(Router, View) {;
Router.implement({
  routes: {
    'route-1/': 'route1',
    'route-2/': 'route2'
  }
});

describe("Router test", function() {
  var r;
  r = null;
  beforeEach(function() {
    Router.implement({
      route1: function(args, data) {},
      route2: function(args, data) {}
    });
    return r = new Router();
  });
  it('matches :param in route properly', function() {
    var match, notMatch, route, routeRegEx, str, _i, _j, _k, _l, _len, _len1, _len2, _len3, _results;
    route = 'page/:number/:param/gehan';
    routeRegEx = r._createRouteRegex(route);
    match = ['page/34/23/gehan', 'page/hd5eg?/asdas/gehan'];
    notMatch = ['page/34', 'page/34/23', 'page/34/23/art'];
    for (_i = 0, _len = match.length; _i < _len; _i++) {
      str = match[_i];
      expect(routeRegEx.exec(str)).toNotBe(null);
    }
    for (_j = 0, _len1 = notMatch.length; _j < _len1; _j++) {
      str = notMatch[_j];
      expect(routeRegEx.exec(str)).toBe(null);
    }
    route = 'page/:number/:param/';
    routeRegEx = r._createRouteRegex(route);
    match = ['page/34/23/'];
    notMatch = ['yeah/page/34/23/', 'page/34/23', 'page/34/23/art'];
    for (_k = 0, _len2 = match.length; _k < _len2; _k++) {
      str = match[_k];
      expect(routeRegEx.exec(str)).toNotBe(null);
    }
    _results = [];
    for (_l = 0, _len3 = notMatch.length; _l < _len3; _l++) {
      str = notMatch[_l];
      _results.push(expect(routeRegEx.exec(str)).toBe(null));
    }
    return _results;
  });
  it('matches *splat in route properly', function() {
    var actual, expected, match, notMatch, route, routeRegEx, str, strMatch, _i, _j, _len, _len1, _results;
    route = 'page/*extra';
    routeRegEx = r._createRouteRegex(route);
    match = [['page/internet', ['page/internet', 'internet']], ['page/you/it', ['page/you/it', 'you/it']]];
    notMatch = ['page'];
    for (_i = 0, _len = match.length; _i < _len; _i++) {
      strMatch = match[_i];
      actual = flatten(routeRegEx.exec(strMatch[0]));
      expected = flatten(strMatch[1]);
      expect(actual).toBe(expected);
    }
    _results = [];
    for (_j = 0, _len1 = notMatch.length; _j < _len1; _j++) {
      str = notMatch[_j];
      _results.push(expect(routeRegEx.exec(str)).toBe(null));
    }
    return _results;
  });
  it('matches *splat and :param in route properly togeter', function() {
    var match, route, routeRegEx, str;
    route = 'page/:number/*stuff';
    routeRegEx = r._createRouteRegex(route);
    str = 'page/internet/fecker/balls/mate';
    match = routeRegEx.exec(str);
    expect(match[1]).toBe('internet');
    return expect(match[2]).toBe('fecker/balls/mate');
  });
  it('remembers params', function() {
    var positions, route;
    route = 'page/:pageId/:section/*path';
    positions = r._extractParamPositions(route);
    return expect(flatten(positions)).toBe(flatten(['pageId', 'section', 'path']));
  });
  it('routes to correct function', function() {
    var found, routes;
    routes = {
      'page/:number/': 'someRoute',
      'page/:number/*stuff': 'someRoute'
    };
    found = null;
    r.someRoute = function() {
      return found = Array.from(arguments);
    };
    r._parseRoutes(routes);
    r._route('page/343/asd/fe', {
      param: 'something'
    });
    return expect(flatten(found)).toBe(flatten([
      {
        number: '343',
        stuff: 'asd/fe'
      }, {
        param: 'something'
      }
    ]));
  });
  it('instantiates attached view class', function() {
    var a, element;
    element = new Element('div');
    a = {
      TestView: new Class
    };
    spyOn(a, 'TestView').andCallThrough();
    Router.implement({
      viewClass: a.TestView
    });
    r = new Router({
      el: element
    });
    expect(a.TestView).toHaveBeenCalledWith({
      injectTo: element
    });
    return Router.implement({
      viewClass: null
    });
  });
  return it('sets var for initalRoute', function() {
    var route1Initial, route2Initial;
    route1Initial = null;
    route2Initial = null;
    Router.implement({
      route1: function(args, data) {
        return route1Initial = this.initialRoute;
      },
      route2: function(args, data) {
        return route2Initial = this.initialRoute;
      }
    });
    spyOn(r, 'getCurrentUri');
    r._startRoute('route-1/', {});
    r._startRoute('route-2/', {});
    expect(route1Initial).toBe(true);
    return expect(route2Initial).toBe(false);
  });
});

describe("SubRouter test", function() {
  var r, sr1, sr2;
  r = null;
  sr1 = null;
  sr2 = null;
  beforeEach(function() {
    Router.implement({
      route1: function(args, data) {},
      route2: function(args, data) {}
    });
    r = new Router();
    sr1 = new Class({
      Extends: Router
    });
    return sr2 = new Class({
      Extends: Router
    });
  });
  it('requires path to subrouter', function() {
    var err, errorThrown;
    errorThrown = false;
    try {
      r._subRoute(sr1, {}, {}, {});
    } catch (_error) {
      err = _error;
      errorThrown = true;
    }
    return expect(errorThrown).toBe(true);
  });
  it('calls subrouter with path', function() {
    var a, s;
    a = {
      sr1: sr1
    };
    s = jasmine.createSpy('subrouter');
    s._startRoute = jasmine.createSpy();
    spyOn(a, 'sr1').andReturn(s);
    spyOn(r, 'getCurrentUri');
    r._subRoute(a.sr1, {
      path: 'internet/face'
    }, {});
    return expect(s._startRoute).toHaveBeenCalledWith('internet/face');
  });
  return it('destroys old subrouter when routing to new one', function() {
    var a, s1, s2;
    spyOn(r, 'getCurrentUri');
    a = {
      sr1: sr1,
      sr2: sr2
    };
    s1 = jasmine.createSpy('subrouter');
    s1._startRoute = jasmine.createSpy();
    s1.destroy = jasmine.createSpy();
    spyOn(a, 'sr1').andReturn(s1);
    s2 = jasmine.createSpy('subrouter');
    s2._startRoute = jasmine.createSpy();
    spyOn(a, 'sr2').andReturn(s2);
    r._subRoute(a.sr1, {
      path: 'internet/face1'
    }, {});
    r._subRoute(a.sr2, {
      path: 'internet/face2'
    }, {});
    return expect(s1.destroy).toHaveBeenCalled();
  });
});

describe("SubView test", function() {
  var a, r;
  r = null;
  a = {};
  beforeEach(function() {
    Router.implement({
      route1: function(args, data) {},
      route2: function(args, data) {}
    });
    r = new Router();
    return a = {
      sv1: new Class,
      sv2: new Class
    };
  });
  it('creates subview and injects inside container element', function() {
    var el, s1;
    el = new Element('div').adopt(new Element('div'));
    s1 = jasmine.createSpy();
    s1.inject = jasmine.createSpy();
    spyOn(a, 'sv1').andReturn(s1);
    document.body.adopt(el);
    r.inject = jasmine.createSpy();
    r.initSubView(a.sv1, el);
    expect(el.getChildren().length).toBe(0);
    return expect(s1.inject).toHaveBeenCalledWith(el);
  });
  return it('destroys old subview when creating another', function() {
    var el, s1, s2;
    el = new Element('div');
    s1 = jasmine.createSpy();
    s1.inject = jasmine.createSpy();
    s1.destroy = jasmine.createSpy();
    spyOn(a, 'sv1').andReturn(s1);
    s2 = jasmine.createSpy();
    s2.inject = jasmine.createSpy();
    spyOn(a, 'sv2').andReturn(s2);
    document.body.adopt(el);
    r.inject = jasmine.createSpy();
    r.initSubView(a.sv1, el);
    r.initSubView(a.sv2, el);
    return expect(s1.destroy).toHaveBeenCalled();
  });
});

});
