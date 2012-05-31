# Router
# ======
#
# Bags.Router badass AMD module

reParam = "\\:(\\w+)"
reSplat = "\\*(\\w+)"
reCombine = new RegExp "#{reParam}|#{reSplat}", 'g'

define -> \

new Class
    Implements: [Options, Events]
    Binds: ['_startRoute', '_getHtml4AtRoot']

    # Configuring routes
    # ====================

    # Set routes object as:
    #
    #     "path/to/match/": "functionName"
    #
    # Path is set without first slash.
    # Function is called as functionName(args, data)
    # Any querystring parameters are passed through as data.
    #
    # Arguments
    # ---------
    #
    # Args are specified in 2 ways:
    #
    # + **/path/:parameter/**
    #
    #   Parameters start with : and match up to the next /
    #
    #   e.g. /path/hello/ matches the above
    #
    #           args = {paramter: 'hello'}
    #
    # + **/path/*splat**
    #
    #   Splats match all characters after the *
    #
    #   e.g. /path/you-love/all/of-it matches the above
    #
    #           args = {splat: 'you-love/all/of-it'
    #
    # Subrouting
    # ----------
    #
    # Routing can be passed off to a sub router by using a
    # route with one splat, which contains the path to be
    # sub-routed, and a function returning the class object.
    #
    # If you are using a view class then you can also pass
    # a container element to this sub router.
    #
    # Functions ared used to get around import order and
    # referencing problems
    #
    # e.g.
    #
    #     routes:
    #         "route/this/*path": -> SubRouterClass
    #
    #     subRouteEl: -> @view.refs.body
    #
    routes: {}

    # If you are using a subrouter then you can specify the container
    # element for its view class. Since on initialisation the element
    # won't exist this will be a function which returns the element.
    subRouteEl: ->

    # Associated view class
    # ---------------------

    # A view can be associated and instatiated when this router
    # is instantiated. For the top-level router this would only
    # happen once, but for subrouters this could happen whenever
    # the path goes out and then back into their focus. When this
    # happens then destroy() is called on the router, which also
    # calls destroy() on the view.
    #
    # When settings a view class a container element for this view
    # must be passed in as an option:
    #
    #     options:
    #         el: Element
    viewClass: null

    # Router options
    # --------------
    options:
        # Using history.js allows for us to have paths like
        # /path/1/#/path/2/, but polluted urls looks bad and would
        # mess with data preloading, so this is set to ensure all
        # hashed are from the root,
        #
        # e.g.
        #
        #     path/1/#/path/2/ -> #/path/2/
        #
        forceHTML4ToRoot: true

        # If you set a viewClass then this will be its container element
        el: null

    # Router methods
    # ==============

    # Starts router and parses routes. The first route done has the @initalRoute flag
    # set.
    initialize: (options) ->
        @setOptions options
        @_parseRoutes()
        @_initView() if @viewClass?
        @initialRoute = true
        @

    # Browser location handling
    # -------------------------

    # If this is the main app router then you'll need to attach this
    # to the window so that it can operate.
    #
    # It works by binding to the statechange event and also does an
    # initial route since there is no statechange on first page load
    attach: ->
        if @options.forceHTML4ToRoot and History.emulated.pushState
            window.addEvent 'statechange', @_getHtml4AtRoot
        window.addEvent 'statechange', @_startRoute
        @_startRoute()
        @

    # You can deatch if you want, although not really necessary.
    detach: ->
        window.removeEvent 'statechange', @_startRoute

    # Subviews
    # --------

    # Commonly changing path can mean delegating a certain part of the
    # screen to a sub view, e.g. main body.
    #
    # To make these easy within a router, and to handle destroying any
    # current subviews you can call these helper function with the
    # viewClass and container element
    #
    # e.g.
    #
    #     @iniSubView PageView, @view.refs.body
    initSubView: (viewClass, el) ->
        if not instanceOf @subView, viewClass
            if not el?
                throw "Cannot init sub view, no el passed in"
            @subView.destroy() if @subView?
            @subView = new viewClass
            el.empty()
            @subView.inject el

    # Subrouting
    # ----------

    # If you wish to manually subroute then call this function, e.g. if you
    # are going to load the subrouter asynchronously.
    _subRoute: (routerClass, args, data, options) ->
        if not instanceOf @_subRouter, routerClass
            @_subRouter.destroy() if @_subRouter?
            @_subRouter = new routerClass options

        # Expect only one arg, a splat for the remaining path.
        if Object.getLength(args) != 1
            throw "Bad subroute, include one splat only"

        path = Object.values(args)[0]
        @_subRouter._startRoute path


    # Others
    # ------

    # This will reset the view to it's initial state, killing any
    # subrouter and subview.
    #
    # This will also re-render the current view.
    reset: ->
        if @_subRouter?
            @_subRouter.destroy()
            delete @_subRouter

        if @subView?
            @subView.destroy()
            delete @subView

        @view.render()

    # Helper method to pull out the current URI as a MooTools object,
    # taking into account the hash and html5 state
    getCurrentUri: ->
        new URI History.getState().url


    # Destroys the current view and detaches from the window object
    destroy: ->
        @_destroyView()
        @detach()

    # Private methods
    # ===============

    _subRouter: null
    _parsedRoutes: []
    _replaceRegex:
        "([^\/]+)": new RegExp reParam, 'g'
        "(.*)": new RegExp reSplat, 'g'

    _startRoute: (path, data) ->
        uri = @getCurrentUri()
        if not path?
            path = uri.get('directory') + uri.get('file')
        if not data?
            data = uri.getData()
        @_findRoute path, data
        @initialRoute = false

    _getHtml4AtRoot: ->
        # For html4 browsers ensure this is a hash off the
        # root of the site. Lame but that's old tech
        u = new URI()
        if u.get('directory') + u.get('file') != '/'
            uri = @getCurrentUri()
            hash = uri.get('directory') + uri.get('file')
            if uri.get 'query'
                hash = "#{hash}?#{uri.get('query')}"
            href = "/##{hash}"
            location.href = href

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

    _findRoute: (path, data) ->
        path = path.substr(1) if path.substr(0,1) == '/'
        for [regEx, funcName, paramNames] in @_parsedRoutes
            match = regEx.exec path
            if match?
                args = match.slice(1).associate paramNames
                if typeOf(funcName) == 'function'
                    routerClass = funcName()
                    return @_subRoute routerClass, args, data,
                        el: @subRouteEl()
                else
                    args = [args]
                    args.push data
                    return @[funcName].apply @, args if match?

    _initView: ->
        if not instanceOf @view, @viewClass
            if not @options.el?
                throw "Cannot init view, no el specified"
            @_destroyView()
            className = $H(window).keyOf(@viewClass)
            @view = new @viewClass
                injectTo: @options.el

    _destroyView: ->
        @view.destroy() if @view?
        @options.el.empty()


