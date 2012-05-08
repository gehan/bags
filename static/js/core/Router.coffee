do ->
    reParam = "\\:(\\w+)"
    reSplat = "\\*(\\w+)"
    reCombine = new RegExp "#{reParam}|#{reSplat}", 'g'

    window.Router = new Class
        Binds: ['startRoute']
        Implements: [Options, Events]

        _replaceRegex:
            "([^\/]+)": new RegExp reParam, 'g'
            "(.*)": new RegExp reSplat, 'g'

        _parsedRoutes: []
        routes: {}
        #    "path/:param/*catchall": "functionName"

        initialize: (options) ->
            @setOptions options
            @_parseRoutes()
            @

        attach: ->
            window.addEvent 'statechange', @startRoute
            @

        startRoute: (path) ->
            uri = @parseURI()
            if not path?
                path = uri.get('directory') + uri.get('file')
            data = uri.getData()
            @findRoute path, data

        _parseRoutes: (routes=@routes) ->
            for route, funcName of routes
                routeRegEx = @_createRouteRegex route
                paramNames = @_extractParamPositions route
                @_parsedRoutes.push [routeRegEx, funcName, paramNames]

        _createRouteRegex: (route) ->
            # Convert route into a regex to match path on
            for replaceWith, findRe of @_replaceRegex
                route = route.replace findRe, replaceWith
            new RegExp "^" + route + '$'

        _extractParamPositions: (route) ->
            params = []
            while (s = reCombine.exec route)
                params.push s.slice(1).erase('').pick()
            params

        parseURI: ->
            path = History.getState().hash
            # Normalize between html4/html5 browsers
            path = "/#{path}" if path.substr(0,1) != '/'
            new URI path

        findRoute: (path, data) ->
            path = path.substr(1) if path.substr(0,1) == '/'
            for [regEx, funcName, paramNames] in @_parsedRoutes
                match = regEx.exec path
                if match?
                    args = [match.slice(1).associate paramNames]
                    args.push data
                    return @[funcName].apply @, args if match?

        destroy: ->
            window.removeEvent 'statechange', @startRoute

