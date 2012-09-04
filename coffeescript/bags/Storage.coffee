define -> \

new Class
    Implements: [Events]

    storage: (operation, model, options={}) ->
        # Cancel request if running?

        method = @_crudMap[operation]

        fail = (reason=null) =>
            if options.failure?
                options.failure reason
            fireEvent "failure", [reason]

        fireEvent = (event, args) =>
            eventName = "#{options.eventName or operation}#{event.capitalize()}"
            @fireEvent eventName, args

        if model?
            requestData = model: JSON.encode model
        else
            requestData = {}

        new Request.JSON
            url: @_getUrl operation
            method: method
            data: requestData

            onRequest: => fireEvent "start"
            onComplete: => fireEvent "complete"
            onFailure: (xhr) => fail()
            onSuccess: (response) =>
                if @isSuccess response
                    data = @parseResponse response
                    if options.success?
                        options.success data
                    fireEvent "success", [data]
                else
                    reason = @parseFailResponse response
                    fail reason
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

    _getUrl: (operation) ->
        url = @url
        if not url? and @collection?
            url = @collection.url
        if not url?
            throw new Error "No url can be found"

        if operation in ['update', 'delete'] or (operation == 'read' and not
                @isCollection)
            "#{url}/#{@id}"
        else
            url
