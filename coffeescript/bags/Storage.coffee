define -> \

new Class
    Implements: [Events]

    storage: (operation, data={}, callbacks={}) ->
        # Cancel request if running?

        method = @_crudMap operation

        fail = (reason=null) =>
            if callbacks.failure?
                callbacks.failure.apply this, [xhr]
            @fireEvent "#{operation}Failure", [reason]

        new Request.JSON
            url: @getUrl
            method: method
            data: data

            onRequest: =>
                @fireEvent "#{operation}Start"

            onComplete: =>
                @fireEvent "#{operation}Complete"

            onSuccess: (response) =>
                if @isSuccess response
                    data = @parseResponse response
                    if callbacks.success?
                        callbacks.success.apply this, [data]
                    @fireEvent "#{operation}Success", [data]
                else
                    reason = @parseFailResponse response
                    fail reason

            onFailure: (xhr) =>
                fail null

        .send()

    isSuccess: (response) ->
        response.success is true

    parseResponse: (response) ->
        response.data

    parseFailResponse: (response) ->
        response.error

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
