Router = null
View = null

done = false
curl ['bags/Router', 'bags/View'], (_Router, _View) ->
    Router = _Router
    View = _View
    done = true

    Router.implement
        routes:
            'route-1/': 'route1'
            'route-2/': 'route2'

flatten = (obj) ->
    JSON.encode obj

describe "Router test", ->
    r = null

    beforeEach ->
        waitsFor -> done
        Router.implement
            route1: (args, data) ->
            route2: (args, data) ->
        r = new Router()

    it 'matches :param in route properly', ->
        route = 'page/:number/:param/gehan'
        routeRegEx = r._createRouteRegex route

        match = [
            'page/34/23/gehan'
            'page/hd5eg?/asdas/gehan'
        ]
        notMatch = [
            'page/34'
            'page/34/23'
            'page/34/23/art'
        ]
        for str in match
            expect(routeRegEx.exec str).toNotBe null
        for str in notMatch
            expect(routeRegEx.exec str).toBe null

        route = 'page/:number/:param/'
        routeRegEx = r._createRouteRegex route

        match = [
            'page/34/23/'
        ]
        notMatch = [
            'yeah/page/34/23/' # Prepended pattern
            'page/34/23'       # Missing last slash
            'page/34/23/art'   # Extra at end
        ]
        for str in match
            expect(routeRegEx.exec str).toNotBe null
        for str in notMatch
            expect(routeRegEx.exec str).toBe null

    it 'matches *splat in route properly', ->
        route = 'page/*extra'
        routeRegEx = r._createRouteRegex route

        match = [
            ['page/internet', ['page/internet', 'internet'] ]
            ['page/you/it', ['page/you/it', 'you/it'], ]
        ]
        notMatch = [
            'page'
        ]
        for strMatch in match
            actual = flatten(routeRegEx.exec strMatch[0])
            expected = flatten strMatch[1]
            expect(actual).toBe expected
        for str in notMatch
            expect(routeRegEx.exec str).toBe null

    it 'matches *splat and :param in route properly togeter', ->
        route = 'page/:number/*stuff'
        routeRegEx = r._createRouteRegex route

        str = 'page/internet/fecker/balls/mate'
        match = routeRegEx.exec str

        expect(match[1]).toBe 'internet'
        expect(match[2]).toBe 'fecker/balls/mate'

    it 'remembers params', ->
        route = 'page/:pageId/:section/*path'
        positions = r._extractParamPositions route

        expect(flatten positions).toBe(flatten ['pageId', 'section', 'path'])

    it 'routes to correct function', ->
        routes =
            'page/:number/': 'someRoute'
            'page/:number/*stuff': 'someRoute'

        found = null
        r.someRoute = ->
            found = Array.from arguments

        r._parseRoutes routes

        r._route 'page/343/asd/fe', param: 'something'

        expect(flatten found).toBe(flatten [{number:'343', stuff:'asd/fe'}, {param: 'something'}])

    it 'instantiates attached view class', ->
        element = new Element 'div'

        a = TestView: new Class
        spyOn(a, 'TestView').andCallThrough()

        Router.implement
            viewClass: a.TestView

        r = new Router
            el: element

        expect(a.TestView).toHaveBeenCalledWith
            injectTo: element

        Router.implement
            viewClass: null

    it 'sets var for initalRoute', ->
        route1Initial = null
        route2Initial = null

        Router.implement
            route1: (args, data) ->
                route1Initial = @initialRoute
            route2: (args, data) ->
                route2Initial = @initialRoute

        spyOn r, 'getCurrentUri'
        r._startRoute 'route-1/', {}
        r._startRoute 'route-2/', {}

        expect(route1Initial).toBe(true)
        expect(route2Initial).toBe(false)

describe "SubRouter test", ->

    r = null
    sr1 = null
    sr2 = null

    beforeEach ->
        Router.implement
            route1: (args, data) ->
            route2: (args, data) ->
        r = new Router()

        sr1 = new Class Extends: Router
        sr2 = new Class Extends: Router

    it 'requires path to subrouter', ->
        errorThrown = false
        try
            r._subRoute sr1, {}, {}, {}
        catch err
            errorThrown = true
        expect(errorThrown).toBe true

    it 'calls subrouter with path', ->
        a = sr1: sr1
        s = jasmine.createSpy 'subrouter'
        s._startRoute = jasmine.createSpy()
        spyOn(a, 'sr1').andReturn s
        spyOn r, 'getCurrentUri'
        r._subRoute a.sr1, path: 'internet/face', {}

        expect(s._startRoute).toHaveBeenCalledWith 'internet/face'

    it 'destroys old subrouter when routing to new one', ->
        spyOn r, 'getCurrentUri'
        a = sr1: sr1, sr2: sr2

        s1 = jasmine.createSpy 'subrouter'
        s1._startRoute = jasmine.createSpy()
        s1.destroy = jasmine.createSpy()
        spyOn(a, 'sr1').andReturn s1

        s2 = jasmine.createSpy 'subrouter'
        s2._startRoute = jasmine.createSpy()
        spyOn(a, 'sr2').andReturn s2

        r._subRoute a.sr1, path: 'internet/face1', {}
        r._subRoute a.sr2, path: 'internet/face2', {}

        expect(s1.destroy).toHaveBeenCalled()

describe "SubView test", ->

    r = null
    a = {}

    beforeEach ->
        Router.implement
            route1: (args, data) ->
            route2: (args, data) ->
        r = new Router()
        a = sv1: new Class, sv2: new Class

    it 'creates subview and injects inside container element', ->
        el = new Element('div').adopt(
            new Element('div')
        )

        s1 = jasmine.createSpy()
        s1.inject = jasmine.createSpy()
        spyOn(a, 'sv1').andReturn s1

        document.body.adopt el
        r.inject = jasmine.createSpy()
        r.initSubView a.sv1, el

        expect(el.getChildren().length).toBe 0
        expect(s1.inject).toHaveBeenCalledWith el

    it 'destroys old subview when creating another', ->
        el = new Element 'div'

        s1 = jasmine.createSpy()
        s1.inject = jasmine.createSpy()
        s1.destroy = jasmine.createSpy()
        spyOn(a, 'sv1').andReturn s1

        s2 = jasmine.createSpy()
        s2.inject = jasmine.createSpy()
        spyOn(a, 'sv2').andReturn s2

        document.body.adopt el
        r.inject = jasmine.createSpy()
        r.initSubView a.sv1, el
        r.initSubView a.sv2, el

        expect(s1.destroy).toHaveBeenCalled()


