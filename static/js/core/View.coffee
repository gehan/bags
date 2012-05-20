define ['core/Template'], (Template) ->

    new Class
        Implements: [Options, Events, Template]

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
            el.store 'view', @

            if not @el?
                @el = el
            else
                @_replaceCurrentEl el

            Object.merge @refs, @getRefs(el)
            @delegateEvents @el, @events
            @fireEvent 'render'

            # See if these elements were inserted into dom
            container = Array.from(el)[0].getParent()
            @_checkDomUpdate container

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
        visual state in template. Doesn't alter events as assumed
        to be run on a child node.
        ###
        rerender: (refs, data) ->
            el = @_render data
            Array.from(refs).each (ref) =>
                replaceThis = @refs[ref]
                if not replaceThis
                    throw "Cannot find ref #{ref} in template #{@template}"
                newEl = @getRefs(el)[ref]
                Object.merge @refs, @getRefs(newEl)
                @refs[ref].replaces replaceThis

                # See if these elements were inserted into dom
                @_checkDomUpdate newEl.getParent()

        _render: (data=@parseForDisplay()) ->
            el = @renderTemplate @template, data

        inject: (container, el=$(@)) ->
            el.inject container
            @_checkDomUpdate container

        _checkDomUpdate: (container) ->
            inDom = false
            parent = container
            if parent == document.body
                inDom = true
            while parent = $(parent).getParent()
                inDom = true if parent == document.body
            if inDom
                document.fireEvent 'domupdated', [container]

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
