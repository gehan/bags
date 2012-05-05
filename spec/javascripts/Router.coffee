do ->

    flatten = (obj) ->
        JSON.encode obj

    describe "Router test", ->
        r = null

        beforeEach ->
            r = new Router()

        afterEach ->
            r.destroy()

        it 'matches :param in route properly', ->
            route = 'page/:number/:param/gehan'
            routeRegEx = r._createRouteRegex route

            match = [
                'page/34/23/gehan'
                'page/hd5eg?/asdas/gehan'
            ]
            notMatch = [
                'page/34/23'
                'page/34/23/art'
                'page/34/art'
                'page/34'
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
                'page/34/23'
                'page/34/23/art'
            ]
            for str in match
                expect(routeRegEx.exec str).toNotBe null
            for str in notMatch
                expect(routeRegEx.exec str).toBe null

        it 'matches *splat in route properly', ->
            route = 'page/*extra'
            routeRegEx = r._createRouteRegex route

            match = [
                'page/internet'
                'page/you-love-it'
                'page/'
            ]
            notMatch = [
                'page'
            ]
            for str in match
                expect(routeRegEx.exec str).toNotBe null
            for str in notMatch
                expect(routeRegEx.exec str).toBe null

        it 'matches *splat and :param in route properly togeter', ->
            route = 'page/:number/*stuff'
            routeRegEx = r._createRouteRegex route

            str = 'page/internet/fecker/balls/mate'
            match = routeRegEx.exec str

            expect(match[1]).toBe 'internet'
            expect(match[2]).toBe 'fecker/balls/mate'

        it 'routes to correct function yo', ->
            routes =
                'page/:number/*stuff': 'someRoute'

            found = null
            r.someRoute = ->
                found = Array.from arguments

            r._parseRoutes routes

            r.findRoute 'page/343/asd/fe'

            expect(flatten found).toBe(flatten ['343', 'asd/fe'])
