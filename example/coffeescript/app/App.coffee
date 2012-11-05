define ['bags/Router', 'app/views/App'], (Router, AppView) -> \

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
        console.log 'apps root'

    pageRouter: (args, data) ->
        console.log 'loading page'
        curl ['app/routers/Page'], (PageRouter) =>
            console.log 'loaded page'
            @_subRoute PageRouter, args, data,
                el: @subRouteEl()

    accountRouter: (args, data) ->
        curl ['app/routers/Account'], (AccountRouter) =>
            @_subRoute AccountRouter, args, data,
                el: @subRouteEl()

