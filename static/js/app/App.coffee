Application = new Class
    Extends: Router

    routes:
        'page/*path': "pageSection"
        'account/*path': "accountSection"

    options:
        element: null

    subRouter: null

    initialize: ->
        @parent.apply @, arguments
        @setView AppView
        @

    pageSection: (args, data) ->
        @subRoute PageRouter, args, data

    accountSection: (args, data) ->
        @subRoute AccountRouter, args, data

Router.implement
    subRoute: (routerClass, args, data) ->
        if not instanceOf @subRouter, routerClass
            @subRouter.destroy() if @subRouter?
            @subRouter = new routerClass element: @view.refs.body

        @subRouter.startRoute args.path

    setView: (viewClass) ->
        if not instanceOf @view, viewClass
            @destroyView()
            @view = new viewClass()
            @view.inject @options.element

    destroyView: ->
        @view.destroy() if @view?
        @options.element.empty()

    destroy: ->
        @destroyView()

AccountRouter = new Class
    Extends: Router

    options:
        element: null

    routes:
        'user/': 'user'
        'user/:id/': 'user'

        'channel/': 'channel'
        'channel/:id/': 'channel'

        ':type/': 'account'
        ':type/:id/': 'account'

    account: (args, data) ->
        @setView AccountView
        console.log 'account ', args.type, args.id

    channel: (args, data) ->
        console.log 'channel ', args.id

    user: (args, data) ->
        console.log 'user ', args.id


PageRouter = new Class
    Extends: Router

    options:
        element: null

    routes:
        ':page/': 'page'
        ':page/:section/': 'page'

    page: (args, data) ->
        pageId = args.page
        section = args.section or 'priority'
        @setView PageView

        @view.setPage pageId
        @view.getSection section

