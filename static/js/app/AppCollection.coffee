ItemCollection = new Class
    Extends: Collection

    model: Model
    url: '/get-page/{pageId}/{section}/'

    fetch: (options) ->
        @parent url: @url.substitute(options)

