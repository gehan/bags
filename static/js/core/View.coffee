View = new Class
    Implements: [Options, Events, Templates]

    model: null
    collection: null

    el: null
    events: {}
    template: null

    options:
        injectTo: null

    initialize: (options={}) ->
        @loadAllTemplates()
        for key in ['collection', 'model', 'el', 'template']
            if options[key]?
                @[key] = options[key]
                delete options[key]
        if @model?
            @model.addEvent 'remove', => @destroy()
        @setOptions options
        @render()
        if @options.injectTo?
            @inject @options.injectTo
        @

    ###
    Renders the element, if already rendered then
    replaces the current element
    ###
    render: (data) ->
        el = @_render data
        el.store 'obj', @

        if not @el?
            @el = el
        else
            @_replaceCurrentEl el

        Object.merge @refs, @getRefs(el)
        @delegateEvents @el, @events
        @fireEvent 'render'
        el

    _replaceCurrentEl: (el) ->
        # Direct replace if single element
        if not instanceOf el, Array
            @el = el.replaces @el

        # If different elements then replace loop,
        # being careful to preserve the references
        else
            @el.each (currentEl, idx) =>
                @el[idx] = el[idx].replaces currentEl

    ###
    Use to rerender a template partially, can be used to preserve
    visual state in template
    ###
    rerender: (refs, data) ->
        el = @_render data
        Array.from(refs).each (ref) =>
            replaceThis = @refs[ref]
            if not replaceThis
                throw "Cannot find ref #{ref} in template #{template}"
            newEl = @getRefs(el)[ref]
            Object.merge @refs, @getRefs(newEl)
            @refs[ref].replaces replaceThis

    _render: (data=@parseForDisplay()) ->
        el = @renderTemplate @template, data

    inject: ->
        el = $ @
        el.inject.apply el, arguments
        if @options.logInjects or true
            injectTo = arguments[0]
            inDom = false
            parent = injectTo
            if parent == document.body
                inDom = true
            while parent = parent.getParent()
                inDom = true if parent == document.body
            console.debug 'inject ', el, ' into ', arguments[0], ' indom ', inDom

        document.fireEvent 'domupdated', [el]

    parseForDisplay: ->
        if @model?
            @model.toJSON()
        else
            @data

    getElement: -> @el.getElement.apply @el, arguments
    getElements: -> @el.getElements.apply @el, arguments

    destroy: ->
        $(@).destroy()

    toElement: -> @el
