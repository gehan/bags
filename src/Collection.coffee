# Provides a simple collection class, which can be used to handle retrieval
# and management of sets of [Model](Model.coffee.html)s

define ['require', 'bags/Storage', 'bags/Events'], (require, Storage, Events) -> \

new Class
    # Extends the native javascript Array object so we get all the methods of
    # this class as well as the Mootools extensions.
    Extends: Array

    # Uses [Storage](Storage.coffee.html) for collection retrieval
    Implements: [Options, Events, Storage]

    options: {}

    # If using a custom Model then it needs to set here, as this class will
    # be used to create new instances after calling `fetch`
    #model: Model

    # If using default `Storage` class then you must set the URL here
    url: null

    # Using the Collection class
    # =====================

    # You can initialise the collection with a set of existing models,
    # e.g. if you bootstrap.
    #
    # If you want to set `@url` or `@model` on init then these can be passed in
    # as `options`
    initialize: (models=[], options={}) ->
        if options.parentModel?
            @parentModel =
                id: options.parentModel.id
                klass: options.parentModel.constructor
            # Can't store actual instance otherwise browswers crash
            # in some instances presumabley down to a circular reference
            delete options.parentModel

        for key in ['model', 'url', 'sortField']
            if options[key]?
                @[key] = options[key]
                delete options[key]
        @setOptions options

        if not @model
            @model = require 'bags/Model'

        @add models, silent: true
        @

    # Collection retrieval
    # --------------------
    #
    # The actual collection storage has been abstracted out to
    # [Storage](Storage.coffee.html)
    # which should be read to learn about the various events fired during each
    # operation and as well as how to handle to returned promise.

    # Use this method to fetch a collectin of models from the server.
    #
    # By default this will replace the current collection with the retrieved
    # collection by calling `@reset`.
    #
    # If you wish to add to the collection rather than replace it then set
    # `options.add=true` and `@add` will be called instead
    fetch: (filter={}, options={}) ->
        promise = @storage 'read', filter
        promise.then (models) =>
            if options.add
                @add models, options
            else
                @reset models, options
            @fireEvent 'fetch', [true] unless options.silent
            return this

    # This will replace the current collection with the models that are passed
    # in, and fires a `reset` event at the end.
    #
    # If you call this without any options it will just empty the collection.
    reset: (models, options={}) ->
        @_remove model, options while model = @pop()
        @add models, silent: true if models?
        @fireEvent 'reset', [@] unless options.silent

    # Call to add a model or an array of models to the collection
    # Fires an `add(model)` event
    add: (model, options={}) ->
        if not @model? then throw new Error "Model not defined for collection"

        if typeOf(model) == 'array'
            added = @_add(m, options) for m in model
        else
            added = @_add model, options

        @sortBy @sortField, silent: true if @sortField?

        unless options.silent
            @fireEvent 'add', [model] for model in Array.from added

    _add: (model, options={}) ->
        model = @_makeModel model
        @push model
        model

    # Provides a shortcut to create a new model in the collection
    create: (attributes, options={}) ->
        model = @_makeModel attributes
        @add model, options
        return model

    # Get model with field matching value
    get: (field, value) ->
        for obj in this
            return obj if obj.get(field) == value

    # Sorts the collection like a normal array but also fires a `sort` event
    sort: (comparator=@comparator, options={}) ->
        @parent comparator
        @fireEvent 'sort' unless options.silent

    sortBy: (field, options) ->
        @sort (a, b ) ->
            aVal = a.get field
            bVal = b.get field
            type = typeOf aVal
            if type == 'number'
                aVal - bVal
            else if type == 'string'
                aVal.toLowerCase().localeCompare bVal.toLowerCase()
            else if type == 'date'
                bVal.diff aVal, 'ms'
        , options

    sortField: null

    # Set this to define a custom comparator for the `sort` function
    comparator: (a, b) ->
        return a - b

    # Returns a JSON ready representation of the Collection. See
    # [Model](Model.coffee.html) for more information.
    toJSON: ->
        @invoke 'toJSON'

    # Private methods
    # ==============
    _makeModel: (model) ->
        if not instanceOf model, @model
            model = new @model model, collection: this
        else if not model.collection?
            model.collection = this
        model.addEvents
            any: =>
                 @_modelEvent model, arguments
            destroy: =>
                index = @indexOf model
                @erase model
                @fireEvent 'remove', [model, index]
        model

    _modelEvent: (model, args) ->
        @fireEvent args[0], [model, args[1]]

     _remove: (model, options={}) ->
        model.removeEvents 'any'
        model.removeEvents 'destroy'
        @erase model
        @fireEvent 'remove', [model] unless options.silent

    isCollection: true
