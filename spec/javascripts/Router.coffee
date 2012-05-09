do ->
    flatten = (obj) ->
        JSON.encode obj

    describe "Router test", ->
        r = null

        beforeEach ->
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

            r.findRoute 'page/343/asd/fe', param: 'something'

            expect(flatten found).toBe(flatten [{number:'343', stuff:'asd/fe'}, {param: 'something'}])

