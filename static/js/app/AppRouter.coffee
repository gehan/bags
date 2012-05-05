AppRouter = new Class
    Extends: Router

    routes:
        'page/:pageId/': 'page'
        'page/:pageId/:pageNumber/': 'page'

    page: (pageId, pageNumber) ->
        console.log 'goto pageId ', pageId, ' number ', pageNumber
