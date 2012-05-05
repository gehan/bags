App = new Class
    Extends: Router

    routes:
        'page/:pageId/': 'page'
        'page/:pageId/:section/': 'page'
        'page/:pageId/:section/:pageNumber/': 'page'

        'account/:section/:id/': 'account'

    page: (args, data) ->
        # Defaults
        pageId = args.pageId
        section = args.section or 'unread'
        page = args.page or 1

        console.log 'page id ', pageId, ' section ' , section,
            ' number ', page, ' data ', data

    account: (args, data) ->
        # Defaults
        section = args.section or 'sources'
        itemId = args.id

        console.log 'account ', section, itemId

