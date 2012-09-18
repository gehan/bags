# Provides a simple model class. The key benefit is separating models from
# your view code, along with concerns like persistance, and interacting
# through the events fired when a model is updated to handle rendering.

define ['require', 'bags/Storage'], (require, Storage) -> \

new Class
    # Uses [Storage](Storage.coffee.html) for model storage
    Implements: [Events, Options, Storage]

    # Specfying field classes (optional)
    # ----------------------------------
    #
    # Specificying fields is not required, as a model will accept whatever
    # fields you give it, however they will just be strings or numbers as
    # the case may be.
    #
    # If you wish to use different classes for fields then you can define them
    # here. If defined for a field then when a value is set, the constructor
    # will be called with that value.
    #
    # e.g. if
    #
    #     fields:
    #         someField: MyObject
    #
    # then
    #
    #     model.set 'someField', id: 1, text: 'Hello there'
    #     => model.someField = new MyObject(id: 1, text: 'Hello there')
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

    # Field defaults
    # --------------

    # Default values for fields can be set also, and do not require a field
    # definition above.
    #
    # e.g.
    #
    #     defaults:
    #         text: "Hello there"
    defaults: {}

    # Model id
    # --------

    # When a model's id field has been set then this field is populated. Setting
    # this field will not change it and will probably break your model
    id: null

    # Some database systems use a different id field to `id`. If this is the case
    # then override it here and that field will be used to give the magic `id`
    # field
    # here
    idField: "id"

    # Using [Collection](Collection.coffee.html) classes as fields
    # ------------------------------------------------------------

    # If you set a field as a Collection then it is handled slightly
    # differently. As well as the field being set as a Collection instance, the
    # collection will be added to the `@collections` object and a
    # `addCollection [key, collection]` event is fired.
    #
    # e.g. if
    #
    #     fields:
    #         myCollection: Collection
    #
    # then
    #
    #     model.set 'myCollection', [{model}, {model}]
    #     => model.collections.myCollection = collection
    collections: {}

    # If using default `Storage` class then you can set the server url here. If
    # the Model was create via a Collection then @url will be read from that.
    url: null

    # Using the Model class
    # =====================
    #
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
    set: (key, value, options={}) ->
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

        unless options.silent
            @fireEvent "change", [key, value]
            @fireEvent "change:#{key}", [value]

    # Whether model is already stored or new
    isNew: -> not @id?

    # Serialisation
    # -------------
    #
    # This method will return a represenation of the model in a format that
    # is suitable for JSON encoding. This is used to store the model but is
    # also very handy for rendering the model in templates etc.
    #
    # For string or numbers their values do not need any conversion, but for
    # any custom classes then serialisation of these can be handled in two ways
    #
    # * **Ensure object has `toJSON` method**
    #
    #   Much like Model and Collection have a `toJSON`, any custom classes you
    #   use for fields can simply have a `toJSON` method
    #
    # * **Specify a custom JSON method**
    #
    #   Alternatively for a given field `myField` you can create a method on
    #   the class called `jsonMyField` which will be called to serialise the
    #   data
    toJSON: ->
        attrs = {}
        for key, value of @_attributes
            attrs[key] = @_jsonKeyValue key, value
        delete attrs._parent
        return attrs

    # Model storage
    # =============
    #
    # The actual model storage has been abstracted out to
    # [Storage](Storage.coffee.html)
    # which should be read to learn about the various events fired during each
    # operation and as well as how to handle to returned promise.

    # Fetches the model from the server, useful if you just have the id
    # of the model.
    fetch: (options={}) ->
        return if @isNew()

        storageOptions = Object.merge {eventName: 'fetch'}, options
        promise = @storage 'read', null, storageOptions
        promise.when (isSucess, data) =>
            if isSuccess
                @set data, silent: true
                @fireEvent 'fetch', [true] unless options.silent

    # Saves the model. Can be called simply as `save()` to store the model in
    # its current state or you can specificy only certain values to update and
    # call `save(field, value)` or `save(fieldValueObject` in the same way you
    # call `set`
    #
    # By default if any values are specified then when the save operation has
    # completed then the standard set `change` events are fired. However if
    # `options.dontWait=true` then the `change` events are fired immediately.
    # This is for if you are assuming request success rather than waiting for
    # it.
    save: (key, value, options={}) ->
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

        setAttrFn = @set.bind this, key, value, options if key?
        setAttrFn() if options.dontWait and setAttrFn?

        storageMethod = if @isNew() then "create" else "update"
        storageOptions = Object.merge {eventName: 'save'}, options
        promise = @storage storageMethod, data, storageOptions
        promise.when (isSuccess, data) =>
            if isSuccess
                setAttrFn() if not options.dontWait and setAttrFn?
                model = data or {}
                @set model, silent: true

    # Deletes the model from storage
    destroy: (options={}) ->
        fireEvent = =>
            @fireEvent 'destroy' unless options.silent

        if @isNew()
            fireEvent()
            return

        if options.dontWait
            fireEvent()

        storageOptions = Object.merge {eventName: 'destroy'}, options
        promise = @storage 'delete', null, storageOptions
        promise.when (isSuccess, data) =>
            if isSuccess
                fireEvent() if not options.dontWait

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
        else if type.prototype and type.prototype.isModel
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
        type = @_getType key
        return type? and type.prototype and type.prototype.isCollection

    _addCollection: (key, value, options={}) ->
        collectionClass = @_getType key
        collection = new collectionClass value, parentModel: @
        @collections[key] = collection
        @fireEvent 'addCollection', [key, collection] unless options.silent
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

    isModel: true