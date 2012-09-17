# Provides a simple collection class, which can be used to handle retrieval
# and management of sets of [Model](Model.coffee.html)s

define ['bags/Model', 'bags/Storage'], (Model, Storage) -> \

new Class
    # Extends the native javascript Array object so we get all the methods of
    # this class as well as the Mootools extensions.
    Extends: Array

    # Uses [Storage](Storage.coffee.html) for collection retrieval
    Implements: [Options, Events, Storage]

    options: {}

    # If using a custom Model then it needs to set here, as this class will
    # be used to create new instances after calling `fetch`
    model: Model

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
        @setOptions options
        @url = @options.url if @options.url?
        @model = @options.model if @options.model?

        @add(model, silent: true) for model in models
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
        promise.when (isSuccess, data) =>
            if isSuccess
                if options.add
                    @add models, options
                else
                    @reset models, options
                @fireEvent 'fetch', [true] unless options.silent

    # This will replace the current collection with the models that are passed
    # in, and fires a `reset` event at the end.
    #
    # If you call this without any options it will just empty the collection.
    reset: (models, options={}) ->
        @_remove model, options while model = @pop()
        @add models, silent: true if models?
        @fireEvent 'reset', [@] unless options.silent

    # Call to add a model or an array of models to the collection
    add: (model, options={}) ->
        if not @model? then throw new Error "Model not defined for collection"
        if typeOf(model) == 'array'
            @add(m, options) for m in model
        else if instanceOf model, @model
            @_add model
            model.collection = @ if not model.collection?
            @fireEvent 'add', [model] unless options.silent
        else
            @create model, options

    # Provides a shortcut to create a new model in the collection
    create: (attributes, options={}) ->
        model = new @model attributes
        @add model, options

    # Sorts the collection like a normal array but also fires a `sort` event
    sort: (comparator=@comparator) ->
        @parent comparator
        @fireEvent 'sort'

    # Set this to define a custom comparator for the `sort` function
    comparator: (a, b) ->
        return a - b

    # Returns a JSON ready representation of the Collection. See
    # [Model](Model.coffee.html) for more information.
    toJSON: ->
        @invoke 'toJSON'

    # Private methods
    # ==============
    _add: (model) ->
        @push model

    _remove: (model, options={}) ->
        @erase model
        @fireEvent 'remove', [model] unless options.silent

    isCollection: true
