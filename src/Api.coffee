# Provides an interface to the resource api on the server via AJAX
`define(['Q', './Events'], function(Q, Events){`

Api = new Class
    Implements: [Events]

    # Model api
    # =============

    # To perform api calls, the [Model](Model.coffee.html) class will
    # call this method and pass simply the operation being performed and any
    # paramteres as needed. The [Collection](Collection.coffee.html) class
    # also uses the `list` operation to fetch multiple models from the api.
    #
    # Default Operations
    # ------------------
    #
    # * Create - `api('create', modelData)`
    #   - POST to `/url`
    # * Read - `api('read', queryFilters)`
    #   - GET from `/url/id`
    # * Update - `api('update', updatedModelData)`
    #   - PUT to `/url/id`
    # * Delete - `api('delete')`
    #   - DELETE to `/url/id`
    # * List - `api('list', queryFilters)`
    #   - GET from `/url/`
    #
    # Can also be used for generic actions on models
    #
    # * 'someAction' - `api('someAction', paramaters)`
    #   - POST to '/url/id/someAction'
    #
    # Handling Operation Completion
    # -----------------------------
    #
    # To signal when the operation is complete you have a choice of using
    # events or using the returned promise.
    #
    # * __Events__
    #
    #   Events are fired when during the various stages of the api request.
    #   They will be prefixed by the api operation or `options.eventName`
    #   if it's been passed in.
    #
    #   * operation`Start` - e.g. readStart
    #
    #      This is fired when the request has been started
    #
    #   * operation`Complete` - e.g. createComplete
    #
    #      This is fired when the request has been completeted, and before
    #      the success/failure events
    #
    #   * operation`Success(data)` - e.g. updateSuccess
    #
    #      This is fired when the actual request has succeeded and `isSuccess`
    #      returns true to indicate operation success. The parsed data as
    #      returned by `parseResponse` is passed through as the first parameter.
    #
    #   * operation`Failure(reason)` - e.g. deleteFailure
    #
    #      This is fired when the request itself has failed or `isSuccess`
    #      has inidicated failure. In the case of `isSuccess` failing then the
    #      failure reason as returned by `parseFailResponse`
    #
    # * __Promises__
    #
    #   Rather than using callbacks the request uses
    #   [Q.js](https://github.com/kriskowal/q)
    #   to return a promise. See the docs on
    #   [Q.js](http://documentup.com/kriskowal/q/)
    #
    #   To be notified when the promise is fulfilled, i.e. the request has
    #   finished in some way, then you can do the following:
    #
    #         promise = model.api(operation)
    #         promise.then (data) ->
    #             # Some success code
    #         , (reason) ->
    #             # Some code to handle the failure
    #
    api: (operation, data, options={}) ->
        deferred = Q.defer()

        method = @_getRequestMethod operation


        fail = (reason=null) =>
            deferred.reject reason
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
                    deferred.resolve data
                    fireEvent "success", [data]
                else
                    reason = @parseFailResponse response
                    fail reason
        .send()

        return deferred.promise

    # Response parsing
    # ----------------

    # If the request itself has succeeded then this function is called with
    # the response to determine if the operation has indeed succeeded.
    isSuccess: (response) ->
        response.success is true

    # If the operation has succeeded then this is called to extract the data
    # returned in the response
    parseResponse: (response) ->
        response.data

    # If the operation has failed then this is called to extract the reason
    parseFailResponse: (response) ->
        response.error

    # Determining the correct URL
    # ---------------------------

    # This determines the correct URL for the given operation. The base URL
    # is expected either be `@url` in the class or in `@collection.url` if
    # the model is part of a collection.
    #
    # For the various operations the url will be
    #
    # * create: `url`
    # * read: `url/id`
    # * update: `url/id`
    # * delete: `url/id`
    # * list: `url`
    #
    # For unknown actions the url will default to
    #
    # * `url/id/<action>`
    #
    _getUrl: (operation) ->
        url = @url
        if not url? and @collection?
            url = @collection.url
        if not url?
            throw new Error "No url can be found"

        def = _methodDefinitions[operation]
        if def
            urlScheme = _urlSchemes[def.scheme]
        else
            urlScheme = _urlSchemes.method

        operationUrl = urlScheme.substitute
            baseUrl: url
            id: @id
            method: operation

        return operationUrl
        if @isCollection
            "#{url}/"
        else if operation in ['update', 'delete', 'read']
            if not @id?
                throw new Error """Model doesn't have an id, cannot perform
                    #{operation}"""

            "#{url}/#{@id}"
        else
            url

    _getRequestMethod: (operation) ->
        def = _methodDefinitions[operation]
        if def
            def.method
        else
            'post'

_urlSchemes =
    file: "{baseUrl}"
    directory: "{baseUrl}/"
    id: "{baseUrl}/{id}"
    method: "{baseUrl}/{id}/{method}"

# Defines what urlschemes and request methods to use for each
# method.
_methodDefinitions =
    create:
        method: 'post'
        scheme: 'file'
    read:
        method: 'get'
        scheme: 'id'
    update:
        method: 'put'
        scheme: 'id'
    delete:
        method: 'delete'
        scheme: 'id'
    list:
        method: 'get'
        scheme: 'directory'

return Api
`})`
