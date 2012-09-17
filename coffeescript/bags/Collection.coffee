define ['bags/Model', 'bags/Storage'], (Model, Storage) -> \

new Class
    Extends: Array
    Implements: [Options, Events, Storage]

    _models: []
    model: Model
    options: {}
    url: null

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

    _add: (model) ->
        @push model

    reset: (models, options={}) ->
        @_remove model, options while model = @pop()
        @add models, silent: true if models?
        @fireEvent 'reset', [@] unless options.silent

    _remove: (model, options={}) ->
        @erase model
        @fireEvent 'remove', [model] unless options.silent

    create: (attributes, options={}) ->
        model = new @model attributes
        @add model, options

    fetch: (filter={}, options={}) ->
        promise = @storage 'read', filter
        promise.when (isSuccess, data) =>
            if isSuccess
                if options.add
                    @add models, options
                else
                    @reset models, options
                @fireEvent 'fetch', [true] unless options.silent

    sort: (comparator=@comparator) ->
        @parent comparator
        @fireEvent 'sort', @

    comparator: (a, b) ->
        return a - b

    toJSON: ->
        @invoke 'toJSON'

    isCollection: true
