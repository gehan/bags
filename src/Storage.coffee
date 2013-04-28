# Provides prersistent model storage via AJAX. You can create alternative
# Storage classes and implement these in your model to use other methods like
# HTML5 local storage.
`define(['Q', './Events'], function(Q, Events){`

# Storage uses CRUD functions, and this is mapped to it's HTTP counterparts
# for this class
_crudMap =
    create: 'post'
    read: 'get'
    update: 'put'
    delete: 'delete'

Storage = new Class
    Implements: [Events]

    # Model storage
    # =============

    # To perform storage functions, the [Model](Model.coffee.html) class will
    # call this method and pass simply the operation being performed and any
    # paramteres as needed. The [Collection](Collection.coffee.html) class
    # also uses the `read` operation to fetch from the storage.
    #
    # Operations
    # ----------
    #
    # * Create - `storage('create', modelData)`
    # * Read - `storage('read', queryFilters)`
    # * Update - `storage('update', updatedModelData)`
    # * Delete - `storage('delete')`
    #
    # Handling Operation Completion
    # -----------------------------
    #
    # To signal when the operation is complete you have a choice of using
    # events or using the returned promise.
    #
    # * __Events__
    #
    #   Events are fired when during the various stages of the storage request.
    #   They will be prefixed by the storage operation or `options.eventName`
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
    #   to return a promise. See the docs
    #   [Promise](http://documentup.com/kriskowal/q/)
    #
    #   To be notified when the promise is fulfilled, i.e. the request has
    #   finished in some way, then you can do the following:
    #
    #         promise = model.storage(operation)
    #         promise.then (data) ->
    #             # Some success code
    #         , (reason) ->
    #             # Some code to handle the failure
    #
    storage: (operation, data, options={}) ->
        deferred = Q.defer()

        method = _crudMap[operation]

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
    #
    # If this is a collection then it will be
    #
    # * read: `url`
    _getUrl: (operation) ->
        url = @url
        if not url? and @collection?
            url = @collection.url
        if not url?
            throw new Error "No url can be found"

        if @isCollection
            "#{url}/"
        else if operation in ['update', 'delete', 'read']
            if not @id?
                throw new Error """Model doesn't have an id, cannot perform
                    #{operation}"""

            "#{url}/#{@id}"
        else
            url

return Storage
`})`
