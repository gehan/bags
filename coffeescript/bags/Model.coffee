# Provides a model

define ['bags/Collection'], (Collection) -> \

Model = new Class
    Implements: [Events, Options]
    Binds: ["_saveStart", "_saveComplete", "_saveSuccess", "_saveFailure"]

    _attributes: {}
    collections: {}

    types: {}
    defaults: {}
    _idField: "id"

    url: "/item/"

    initialize: (attributes, options) ->
        @setOptions options
        @_setInitial attributes
        @

    set: (key, value, options={silent: false}) ->
        if typeOf(key) == 'object'
            # Key = attrs, value = options
            attrs = key
            opts = value or options
            @set k, v, opts for k, v of attrs
            # Don't fire change event when setting multiple
            return
        else if @_isCollection key, value
            # Check for collections
            @_attributes[key] = @_addCollection key, value
        else
            # Else set normally
            @_attributes[key] = @_makeValue key, value
            if key == @_idField
                @id = value
        if not options.silent
            @fireEvent "change", [key, value]
            @fireEvent "change:#{key}", [value]

    get: (key) ->
        @_attributes[key]

    has: (key) ->
        @_attributes[key]?

    fetch: (options={}) ->
        return if @isNew()
        @request.cancel() if @request?
        @request = new Request.JSON(
            url: @_getUrl()
            method: 'get'
            onSuccess: (response) => @_fetchDone response, options
        ).send()

    save: (key, value, options={dontWait: false, silent: false}) ->
        # Save current state, update with any extra values
        toUpdate = Object.clone this
        toUpdate.set key, value, silent: true
        data = toUpdate.toJSON()

        if typeOf(key, 'object')
            options = Object.merge(options, value)

        # Update values immediately if saving optimistically
        setAttrFn = @set.bind this, key, value, options
        setAttrFn() if options.dontWait

        new Request.JSON
            url: @_getUrl()
            data: data
            method: if @isNew() then "POST" else "UPDATE"
            onRequest: @_saveStart
            onComplete: @_saveComplete
            onSuccess: (response) =>
                if @_isSaveSuccess response
                    setAttrFn() if not options.dontWait
                    @_saveSuccess response
                    options.success response if options.success?
                else
                    reason = @parseFailResponse response
                    @_saveFailure reason
            onFailure: (xhr) =>
                @_saveFailure xhr
                options.failure xhr if options.failure?
        .send()

    parseResponse: (response) ->
        response.data

    parseFailResponse: (response) ->
        response.error

    isNew: -> not @id?

    remove: ->
        @fireEvent 'remove', [@]

    toJSON: ->
        attrs = {}
        for key, value of @_attributes
            attrs[key] = @_jsonKeyValue key, value
        delete attrs._parent
        return attrs

    # Private methods
    # ===============

    _getUrl: ->
        if @isNew()
            @url
        else
            "#{@url}/#{@id}"

    _setInitial: (attributes={}) ->
        defaults = Object.map (Object.clone(@defaults)), (value, key) =>
            @_getDefault key

        # Merge defaults into attributes like this to
        # keep references intact
        attrKeys = Object.keys attributes
        defaults = Object.filter defaults, (value, key) ->
            key not in attrKeys

        Object.merge attributes, defaults
        @set attributes, silent: true

    _getType: (name) ->
        type = @types[name]
        if typeOf(type) == "function"
            type()
        else if typeOf(type) ==  "string"
            window[type]
        else
            type

    _addCollection: (key, value, options={}) ->
        collectionClass = @_getType key
        collection = new collectionClass value, parentModel: @
        @collections[key] = collection
        @fireEvent 'addCollection', [key, collection]
        collection

    _isCollection: (key, value) ->
        type = @_getType key
        type? and typeOf(value) == 'array' and instanceOf new type(), Collection

    _makeValue: (key, value) ->
        type = @_getType key
        if typeOf(value) == 'array'
            (@_makeValue(key, item) for item in value)
        else if not type
            value
        else if type is String
            String value
        else if type is Number
            Number.from value
        else if type is Date
            Date.parse value
        # TODO check class constructor itself rather than creating instance
        # not sure if possible as instanceof instpects prototype or constructor
        # chain
        else if instanceOf new type(), Model
            value = value or {}
            value._parent = @
            new type(value)
        else
            new type(value)

    _getDefault: (key) ->
        def = @defaults[key]
        if typeOf(def) == 'function'
            def.call @
        else
            def

    _fetchDone: (response, options={}) ->
        model = @parseResponse response
        @set model, silent: true
        @fireEvent 'fetch', [true]

    _saveStart: ->
        @fireEvent 'saveStart'

    _saveComplete: ->
        @fireEvent 'saveComplete'

    _saveSuccess: (response) ->
        model = @parseResponse(response) or {}
        @set model, silent: true
        @fireEvent 'saveSuccess'

    _saveFailure: (reason) ->
        @fireEvent 'saveFailure'

    _isSaveSuccess: (response) ->
        response.success is true

    _jsonKeyValue: (key, value) ->
        jsonFn = "json#{key.capitalize()}"
        if @[jsonFn]?
            @[jsonFn](value)
        else if key == '_parent'
            # Skip parent model reference
        else if typeOf(value) == 'array'
            (@_jsonValue v for v in value)
        else
            @_jsonValue value

    _jsonValue: (value) ->
        if value and typeOf(value.toJSON) == 'function'
            value.toJSON()
        else
            value
