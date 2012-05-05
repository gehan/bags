Router = new Class
    Binds: ['startRoute']
    Implements: [Options, Events]

    _replaceRegex:
        "([^\/]+)": /\:\w+/g
        "(.*)": /\*\w+/g

    _parsedRoutes: []
    routes: {}
    #    "path/:param/*catchall": "functionName"

    initialize: (options) ->
        @setOptions options
        @_parseRoutes()
        @

    attach: ->
        window.addEvent 'statechange', @startRoute

    startRoute: ->
        uri = @parseURI()
        path = uri.get('directory') + uri.get('file')
        data = uri.getData()

        @findRoute path

    _parseRoutes: (routes=@routes) ->
        for route, funcName of routes
            routeRegEx = @_createRouteRegex route
            @_parsedRoutes.push [routeRegEx, funcName]

    _createRouteRegex: (route) ->
        # Convert route into a regex to match path on
        for replaceWith, findRe of @_replaceRegex
            route = route.replace findRe, replaceWith
        new RegExp route + '$'

    parseURI: ->
        path = History.getState().hash

        # Normalize between html4/html5 browsers
        if path.substr(0,1) == '/'
            path = path.substr 1

        new URI path

    findRoute: (path) ->
        for [regEx, funcName] in @_parsedRoutes
            match = regEx.exec path
            if match?
                args = match.slice(1)
                return @[funcName].apply @, args if match?

    destroy: ->
        window.removeEvent 'statechange', @startRoute

