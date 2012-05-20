define ['core/Router', 'app/views/Account'], (Router, AccountViews) ->

    new Class
        Extends: Router

        routes:
            '': 'root'

            'user/': 'user'
            'user/:id/': 'user'

            'channel/': 'channel'
            'channel/:id/': 'channel'

            #':type/': 'account'
            #':type/:id/': 'account'

        viewClass: AccountViews.Root

        root: (args, data) ->
            # Must be a better way of doing this
            @reset() if not @initialRoute
            console.log 'root'

        account: (args, data) ->
            console.log 'account ', args.type, args.id

        channel: (args, data) ->
            @initSubView AccountViews.Channel, @view.refs.accountBody

        user: (args, data) ->
            @initSubView AccountViews.User, @view.refs.accountBody

