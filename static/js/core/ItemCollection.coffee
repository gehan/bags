ItemCollection = new Class
    Extends: Collection

    model: ItemModel

    url: '/get-data/'

    fetch: (options={sourceId: None, section: None, page: None}) ->
        @parent url: @url.substitute options

    parse: (response) ->
        response.items

    comparator: (a, b) ->
        Date.compare a.get('updated'), b.get('updated')
