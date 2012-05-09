Application = new Class
    Extends: Router

    routes:
        'page/*path': "pageSection"
        'account/*path': "accountSection"

    viewClass: AppView

    pageSection: (args, data) ->
        @subRoute PageRouter, args, data, el: @view.refs.body

    accountSection: (args, data) ->
        @subRoute AccountRouter, args, data, el: @view.refs.body

AccountRouter = new Class
    Extends: Router

    routes:
        '': 'root'

        'user/': 'user'
        'user/:id/': 'user'

        'channel/': 'channel'
        'channel/:id/': 'channel'

        ':type/': 'account'
        ':type/:id/': 'account'

    viewClass: AccountView

    root: (args, data) ->
        console.log 'root'

    account: (args, data) ->
        console.log 'account ', args.type, args.id

    channel: (args, data) ->
        @initSubView ChannelView, @view.refs.accountBody

    user: (args, data) ->
        @initSubView UserView, @view.refs.accountBody

PageRouter = new Class
    Extends: Router

    routes:
        ':page/': 'page'
        ':page/:section/': 'page'

    viewClass: PageView

    page: (args, data) ->
        pageId = args.page
        section = args.section or 'priority'
        @view.setPage pageId
        @view.getSection section

