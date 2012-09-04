define -> \

new Class
    Implements: [Events]

    storage: (operation, data, options={}) ->
        Future = require 'future'
        promise = new Future()

        # Cancel request if running?

        method = @_crudMap[operation]

        fail = (reason=null) =>
            promise.fulfill false, reason
            fireEvent "failure", [reason]

        fireEvent = (event, args) =>
            eventName = "#{options.eventName or operation}#{event.capitalize()}"
            @fireEvent eventName, args unless options.silent

        if operation == 'read'
            requestData = data
        else if data?
            requestData = model: JSON.encode data
        else
            requestData = {}

        promise.request = new Request.JSON
            url: @_getUrl operation
            method: method
            data: requestData

            onRequest: => fireEvent "start"
            onComplete: => fireEvent "complete"
            onFailure: (xhr) => fail()
            onSuccess: (response) =>
                if @isSuccess response
                    data = @parseResponse response
                    promise.fulfill true, data
                    fireEvent "success", [data]
                else
                    reason = @parseFailResponse response
                    fail reason
        .send()

        return promise

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

            if not @id?
                throw new Error "Model doesn't have an id, cannot perform #{operation}"

            "#{url}/#{@id}"
        else
            url
