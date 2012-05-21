define ['core/Collection'], (Collection) ->

    Model = new Class
        Implements: [Events, Options]

        _attributes: {}
        collections: {}

        _types: {}
        _defaults: {}
        _idField: "id"

        url: "/item/"

        initialize: (attributes, options) ->
            @setOptions options
            @_setInitial attributes
            @

        _setInitial: (attributes={}) ->
            defaults = Object.map (Object.clone(@_defaults)), (value, key) =>
                @_getDefault key

            # Merge defaults into attributes like this to
            # keep references intact
            attrKeys = Object.keys attributes
            defaults = Object.filter defaults, (value, key) ->
                key not in attrKeys

            Object.merge attributes, defaults
            @setMany attributes, silent: true

        setMany: (attrs, options) ->
            @set k, v, options for k, v of attrs

        set: (key, value, options={silent: false}) ->
            if @_isCollection key, value
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

        _getType: (name) ->
            type = @_types[name]
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
            # not sure if possible as instanceof instpects prototype or constructor chain
            else if instanceOf new type(), Model
                value = value or {}
                value._parent = @
                new type(value)
            else
                new type(value)

        _getDefault: (key) ->
            def = @_defaults[key]
            if typeOf(def) == 'function'
                def.call @
            else
                def

        fetch: (options={}) ->
            @request.cancel() if @request?
            @request = new Request.JSON(
                url: "#{options.url or @url}#{@id}/"
                method: 'get'
                onSuccess: (response) => @_fetchDone response, options
            ).send()

        _fetchDone: (response, options={}) ->
            model = @parseResponse response
            @setMany model, silent: true
            @fireEvent 'fetch', [true]

        parseResponse: (response) ->
            response

        save: ->
            console.log 'save friend'

        toJSON: ->
            attrs = {}
            for key, value of @_attributes
                attrs[key] = @_jsonKeyValue key, value
            delete attrs._parent
            return attrs

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
            if typeOf(value) == 'object' and typeOf(value.toJSON) == 'function'
                value.toJSON()
            else
                value

        remove: ->
            @fireEvent 'remove', [@]
