AppView = new Class
    Extends: View

    template: 'base'

    initialize: ->
        @parent.apply @, arguments

        @router = new Application(view: @).attach()
        @router.startRoute()
        @


PageView = new Class
    Extends: View

    template: 'page'

    data:
        pageId: null

    setPage: (pageId) ->
        if @data.pageId isnt pageId
            @data.pageId = pageId
            @rerender 'leftNav'


AccountView = new Class
    Extends: View

    template: 'account'

