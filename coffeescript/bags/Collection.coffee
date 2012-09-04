define ['bags/Model', 'bags/Storage'], (Model, Storage) -> \

new Class
    Extends: Array
    Implements: [Options, Events, Storage]

    _models: []
    model: Model
    options: {}
    url: null

    initialize: (models=[], options={}) ->
        @url = options.url if options.url?
        @model = options.model if options.model?
        @setOptions options

        for model in models
            @add model, silent: true
        @

    add: (model, options={silent: false}) ->
        if not @model? then throw new Error "Model not defined for collection"
        if typeOf(model) == 'array'
            @add(m, options) for m in model
        else if instanceOf model, @model
            @_add model
            model.collection = @ if not model.collection?
            @fireEvent 'add', [model] if not options.silent
        else
            @create model, options

    _add: (model) ->
        @push model

    reset: (models, options={}) ->
        @_remove model, options while model = @pop()
        @add models, silent: true if models?
        @fireEvent 'reset', [@] if not options.silent

    _remove: (model, options) ->
        @erase model
        @fireEvent 'remove', [model] if not options.silent

    create: (attributes, options={}) ->
        model = new @model attributes
        @add model, options

    fetch: (filter={}, options={}) ->
        promise = @storage 'read', filter
        promise.when (isSuccess, data) =>
            if isSuccess
                @_fetchDone data, options

    _fetchDone: (models, options={}) ->
        if options.add
            @add models, options
        else
            @reset models, options
        @fireEvent 'fetch', [true]

    sort: (comparator=@comparator) ->
        @parent comparator
        @fireEvent 'sort', @

    comparator: (a, b) ->
        return a - b

    toJSON: ->
        @invoke 'toJSON'

    isCollection: true
