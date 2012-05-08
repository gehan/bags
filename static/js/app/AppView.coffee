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

    initialize: ->
        @parent.apply @, arguments

        # Items collection
        @collection = new ItemCollection

        @

    setPage: (pageId) ->
        if @data.pageId isnt pageId
            @data.pageId = pageId
            @rerender 'leftNav'

    getSection: (section) ->
        @data.section = section


AccountView = new Class
    Extends: View

    template: 'account'

