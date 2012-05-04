Model = new Class
    Implements: [Events, Options]

    _attributes: {}
    collections: {}

    _types: {}
    _defaults: {}

    options:
        url: "/item/"

    initialize: (attributes, options) ->
        @setAttributes attributes
        @setOptions options
        @

    setAttributes: (attributes={}) ->
        for key, value of attributes
            @set key, value, silent: true
        for key, value of @_defaults
            @set key, @_getDefault(key, value) if not @has key

    set: (key, value, options={silent: false}) ->
        if @_isCollection key, value
            # Check for collections
            @_addCollection key, value
        else
            # Else set normally
            @_attributes[key] = @_makeValue key, value
        if not options.silent
            @fireEvent "change", [key, value]
            @fireEvent "change:#{key}", [value]

    get: (key) ->
        @_attributes[key]

    has: (key) ->
        @_attributes[key]?

    _addCollection: (key, value, options={}) ->
        collectionClass = window[@_types[key]]
        collection = new collectionClass @, value
        @collections[key] = collection
        @fireEvent 'addCollection', [key, collection]

    _isCollection: (key, value) ->
        type = window[@_types[key]]
        type? and typeOf(value) == 'array' and instanceOf new type(), SubCollection

    _makeValue: (key, value) ->
        type = window[@_types[key]]
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
        # not sure if possible as instanceof instpects prototype or constructor chain
        else if instanceOf new type(), Model
            value = value or {}
            value._parent = @
            new type(value)
        else
            new type(value)

    _getDefault: (key, value) ->
        def = @_defaults[key]
        if typeOf(def) == 'function'
            def.call @
        else
            def

    save: ->
        console.log 'save friend'

    toJSON: ->
        attrs = {}
        for key, value of @_attributes
            jsonFn = "json#{key.capitalize()}"
            if @[jsonFn]?
                attrs[key] = @[jsonFn](value)
            else if key == '_parent'
            else if typeOf(value) == 'array'
                attrs[key] = []
                for v in value
                    if typeOf(v) == 'object' and typeOf(v.toJSON) == 'function'
                        jsonV = v.toJSON()
                    else
                        jsonV = v
                    attrs[key].push jsonV
            else if typeOf(value) == 'object' and typeOf(value.toJSON) == 'function'
                attrs[key] = value.toJSON()
            else
                attrs[key] = value
        return attrs

    remove: ->
        @fireEvent 'remove', [@]
