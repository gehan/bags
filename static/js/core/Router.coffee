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

        # "path/:param/*catchall": "functionName"
        routes: {}
        _parsedRoutes: []
        subRouter: null

        # Maybe have separate class for view stuff
        viewClass: null
        options:
            el: null

        initialize: (options) ->
            @setOptions options
            @_parseRoutes()
            @_initView() if @viewClass
            @

        attach: ->
            window.addEvent 'statechange', @startRoute
            @

        detach: ->
            window.removeEvent 'statechange', @startRoute

        startRoute: (path, data) ->
            uri = @parseURI()
            if not path?
                path = uri.get('directory') + uri.get('file')
            if not data?
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
                    args = match.slice(1).associate paramNames
                    if typeOf(funcName) == 'function'
                        routerClass = funcName()
                        return @subRoute routerClass, args, data,
                            el: @subRouteEl()
                    else
                        args = [args]
                        args.push data
                        return @[funcName].apply @, args if match?

        subRoute: (routerClass, args, data, options) ->
            if not instanceOf @subRouter, routerClass
                @subRouter.destroy() if @subRouter?
                @subRouter = new routerClass options

            # Expect only one arg, a splat for the remaining path
            if Object.getLength(args) != 1
                throw "Bad subroute, include one splat only"

            path = Object.values(args)[0]
            @subRouter.startRoute path


        ##############################
        # Maybe put in different class
        _initView: ->
            if not instanceOf @view, @viewClass
                if not @options.el?
                    throw "Cannot init view, no el specified"
                @_destroyView()
                @view = new @viewClass()
                @view.inject @options.el

        _destroyView: ->
            @view.destroy() if @view?
            @options.el.empty()

        initSubView: (viewClass, el) ->
            if not instanceOf @subView, viewClass
                if not el?
                    throw "Cannot init sub view, no el passed in"
                @subView.destroy() if @subView?
                @subView = new viewClass()
                @subView.inject el

        destroy: ->
            @_destroyView()
            @detach()

