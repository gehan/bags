// Generated by CoffeeScript 1.3.1

(function() {
  var flatten;
  flatten = function(obj) {
    return JSON.encode(obj);
  };
  return describe("Router test", function() {
    var r;
    r = null;
    beforeEach(function() {
      return r = new Router();
    });
    afterEach(function() {
      return r.destroy();
    });
    it('matches :param in route properly', function() {
      var match, notMatch, route, routeRegEx, str, _i, _j, _k, _l, _len, _len1, _len2, _len3, _results;
      route = 'page/:number/:param/gehan';
      routeRegEx = r._createRouteRegex(route);
      match = ['page/34/23/gehan', 'page/hd5eg?/asdas/gehan'];
      notMatch = ['page/34/23', 'page/34/23/art', 'page/34/art', 'page/34'];
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
      notMatch = ['page/34/23', 'page/34/23/art'];
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
    return it('routes to correct function', function() {
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
      r.findRoute('page/343/asd/fe', {
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
  });
})();
