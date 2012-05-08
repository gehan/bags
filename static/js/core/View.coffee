View = new Class
    Implements: [Options, Events, Templates]

    model: null
    collection: null

    el: null
    events: {}
    template: null

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
        @

    ###
    Renders the element, if already rendered then
    replaces the current element
    ###
    render: (data) ->
        el = @_render data
        el.store 'obj', @
        @el = if @el then el.replaces @el else el

        Object.merge @refs, @getRefs(el)

        @delegateEvents el, @events
        @fireEvent 'render'
        el

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
        document.fireEvent 'domupdated'

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
