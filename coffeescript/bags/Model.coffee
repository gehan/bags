# Provides a simple model class. The key benefit is separating models from
# your view code, along with concerns like persistance, and interacting
# through the events fired when a model is updated to handle rendering.

define ['require', 'bags/Storage'], (require, Storage) -> \

Model = new Class
    Implements: [Events, Options, Storage]

    # Specificying fields is not required, as a model will accept whatever
    # fields you give it, however they will just be strings or numbers as
    # the case may be.
    #
    # If you wish to define types you can do so here, and when a value is
    # passed to that field (e.g. JSON string representation) this class
    # will be instatiated using that class as the first parameter,
    #
    # Values can be the class object directly, a function that returns a
    # class or a string which will be queries as window[string]
    #
    # e.g.
    #
    #     fields:
    #         createdDate: Date
    #         someObj: "ObjectClass"
    #         someModel: -> SomeModel
    fields: {}


    # Default values for fields can be set also, and do not require a field
    # definition above.
    #
    # e.g.
    #
    #     defaults:
    #         text: "Hello there"
    defaults: {}

    # When a model's id field has been set then this field is populated. Setting
    # this field will not change it and will probably break your model
    id: null

    # Some database systems use a different id field to `id`. If this is the case
    # then override it here and that field will be used to give the magic `id` field
    # here
    idField: "id"

    # Collections can be associated with a model so as sub collections, e.g. a post
    # object has number of comments associate with it. For this to work you would
    # need to define the field as a Collection field in `fields`. To make Collection
    # field access simpler they would then be stored in `collections[fieldName]`
    collections: {}

    # When instantiating a model often you will be passing it's field values to as
    # the `attributes` object, typically after a json response from the server.
    #
    # e.g.
    #
    #     m = new Model
    #         id: 5
    #         text: "Hello there everyone"
    #         createdDate: "2012/05/15"
    #
    # Usually a model would be part of a collection and generally instatiated from
    # there but if that's not the case then you pass in the collection it's part of
    # directly, and the server resource url too for persistance. Generally the url
    # would be taken from the associated collection.
    #
    # When a model is first instatiated no events are fired.
    initialize: (attributes, options={}) ->
        @url = options.url if options.url?
        @collection = options.collection if options.collection?
        @setOptions options
        @_setInitial attributes
        @

    # Simple has, get methods
    has: (key) ->
        @_attributes[key]?

    get: (key) ->
        @_attributes[key]

    # Set can accept `key`, `value` arguments to set one field's value, or it
    # can accept a key/value object to set multiple at once.
    #
    # If any fields are defined then the value will be passed to the field class.
    # If the value is an Collection then it is also added to `@collection`.
    #
    # For each field that's updated 2 `change` events are fired to notify any
    # listeners, unless `silent: true` is passed through as an option.
    set: (key, value, options={silent: false}) ->
        if typeOf(key) == 'object'
            attrs = key
            opts = value or options
            @set k, v, opts for k, v of attrs
            return
        else if @_isCollection key, value
            @_attributes[key] = @_addCollection key, value
        else
            @_attributes[key] = @_makeValue key, value
            if key == @idField
                @id = value
        if not options.silent
            @fireEvent "change", [key, value]
            @fireEvent "change:#{key}", [value]

    # Fetchs the model from the server, useful if you just have the id
    # of the model.
    #
    # Fires a `fetch` event after the model has been successfully fetched
    # and parsed.
    fetch: (options={}) ->
        return if @isNew()

        promise = @storage 'read', null, eventName: 'fetch'
        promise.when (isSucess, data) =>
            if isSuccess
                @set data, silent: true
                @fireEvent 'fetch', [true]

    # Saves the model in its current state to the server or only specific
    # fields if passed in.
    save: (key, value, options={dontWait: false, silent: false}) ->
        ModelClass = @$constructor
        if key?
            attrs = {}
            attrs[@idField] = @id if not @isNew()
            toUpdate = new ModelClass attrs
            toUpdate.set key, value, silent: true if key?
        else
            toUpdate = new ModelClass @toJSON()

        data = toUpdate.toJSON()

        if typeOf(key, 'object')
            options = Object.merge(options, value)

        # Update values immediately if saving optimistically
        setAttrFn = @set.bind this, key, value, options if key?
        setAttrFn() if options.dontWait and setAttrFn?

        # Send to storage
        storageMethod = if @isNew() then "create" else "update"
        promise = @storage storageMethod, data, eventName: 'save'
        promise.when (isSuccess, data) =>
            if isSuccess
                setAttrFn() if not options.dontWait and setAttrFn?
                model = data or {}
                @set model, silent: true

    isNew: -> not @id?

    destroy: (options={dontWait: false}) ->
        if @isNew()
            @fireEvent 'destroy'
            return

        if options.dontWait
            @fireEvent 'destroy'

        promise = @storage 'delete', null, eventName: 'destroy'
        promise.when (isSuccess, data) =>
            if isSuccess
                @fireEvent 'destroy' if not options.dontWait

    toJSON: ->
        attrs = {}
        for key, value of @_attributes
            attrs[key] = @_jsonKeyValue key, value
        delete attrs._parent
        return attrs

    # Private methods
    # ===============
    _attributes: {}

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

    _getType: (name) ->
        type = @fields[name]
        if typeOf(type) == "function"
            type()
        else if typeOf(type) ==  "string"
            window[type]
        else
            type

    _isCollection: (key, value) ->
        try
            Collection = require 'bags/Collection'
        catch error
            # Error loading module, which means this can't possibly
            # be a collection so we can safely return false
            return false
        type = @_getType key
        type? and typeOf(value) == 'array' and instanceOf new type(), Collection

    _addCollection: (key, value, options={}) ->
        collectionClass = @_getType key
        collection = new collectionClass value, parentModel: @
        @collections[key] = collection
        @fireEvent 'addCollection', [key, collection]
        collection

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

    _getDefault: (key) ->
        def = @defaults[key]
        if typeOf(def) == 'function'
            def.call @
        else
            def

    _isSuccess: (response) ->
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
