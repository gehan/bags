ItemCollection = new Class
    Extends: Collection

    model: Model
    url: '/page/{pageId}/{section}/'

    fetch: (options) ->
        @parent url: @url.substitute(options)

