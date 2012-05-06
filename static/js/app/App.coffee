AppRouter = new Class
    Extends: Router

    routes:
        'page/*path': "pageSection"
        'account/*path': "accountSection"

    options:
        view: null

    subRouter: null

    pageSection: (args, data) ->
        if not instanceOf @subRouter, PageRouter
            @subRouter.destroy() if @subRouter?
            @subRouter = new PageRouter element: @options.view.refs.body

        @subRouter.startRoute args.path

    accountSection: (args, data) ->
        if not instanceOf @subRouter, AccountRouter
            @subRouter.destroy() if @subRouter?
            @subRouter = new AccountRouter element: @options.view.refs.body

        @subRouter.startRoute args.path

Router.implement
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
        @setView PageView

        console.log 'page ', args.page, args.section

