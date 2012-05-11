Collection = new Class
    Extends: Array
    Implements: [Options, Events]

    _models: []
    model: null
    options: {}
    url: null

    initialize: (models=[], options) ->
        @setOptions options
        for model in models
            @add model, silent: true
        @

    add: (model, options={}) ->
        if not @model? then throw new Error "Model not defined for collection"
        if typeOf(model) == 'array'
            @add(m, options) for m in model
        else if instanceOf model, @model
            @_add model
            @fireEvent 'add', [model] if not options.silent
        else
            @create model, options

    _add: (model) ->
        model.addEvent 'remove', (m) => @_remove(m, silent: true)
        @push model

    reset: (models, options={}) ->
        @_remove model, options while model = @pop()
        @add models, silent: true
        @fireEvent 'reset', [@] if not options.silent

    _remove: (model, options) ->
        @erase model
        @fireEvent 'remove', [model] if not options.silent

    create: (attributes, options={}) ->
        model = new @model attributes
        @add model, options

    fetch: (options={}) ->
        # Don't double up requests, cancel existing
        @request.cancel() if @request?
        @request = new Request.JSON(
            url: options.url or @url
            method: 'get'
            dontTrack: true
            onSuccess: (response) => @_fetchDone response, options
        ).send()

    _fetchDone: (response, options={}) ->
        models = @parseResponse response
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

    parseResponse: (response) ->
        return response
