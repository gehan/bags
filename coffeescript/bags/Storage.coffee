define -> \

new Class
    Implements: [Options, Events]

    _crudMap:
        read: 'get'
        create: 'post'
        update: 'put'
        delete: 'delete'

    _getUrl: ->
        url = @url
        if not url? and @collection?
            url = @collection.url
        if not url?
            throw new Error "No url specified in model collection or model itself"

        if @isNew()
            url
        else
            "#{url}/#{@id}"

    storage: (operation, data={}) ->
        # Cancel request if running?

        method = @_crudMap operation

        new Request.JSON
            url: @getUrl
            method: method
            data: data

            onRequest: =>
                @fireEvent "#{operation}Start"

            onComplete: =>
                @fireEvent "#{operation}Complete"

            onSuccess: (response) =>
                @fireEvent "#{operation}Success"

            onFailure: (xhr) =>
                @fireEvent "#{operation}Failure"

        .send()

    parseResponse: (response) ->
        response.data

    parseFailResponse: (response) ->
        response.error

    _isSuccess: (response) ->
        response.success is true
