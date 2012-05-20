define ['core/Router', 'app/views/App'], (Router, AppView) ->

    new Class
        Extends: Router

        routes:
            '': 'root'
            'page/*path': 'pageRouter'
            'account/*path': 'accountRouter'

        viewClass: AppView
        subRouteEl: -> @view.refs.body

        root: ->
            @reset() if not @initialRoute
            console.log 'app root'

        pageRouter: (args, data) ->
            curl(
                ['app/routers/PageRouter'],
                (PageRouter) =>
                    @_subRoute PageRouter, args, data,
                            el: @subRouteEl()
            )

        accountRouter: (args, data) ->
            curl(
                ['app/routers/AccountRouter'],
                (AccountRouter) =>
                    @_subRoute AccountRouter, args, data,
                            el: @subRouteEl()
            )


