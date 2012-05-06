AppView = new Class
    Extends: View

    template: 'base'

    initialize: ->
        @parent.apply @, arguments

        @router = new AppRouter(view: @).attach()
        @router.startRoute()


PageView = new Class
    Extends: View

    template: 'page'

AccountView = new Class
    Extends: View

    template: 'account'

