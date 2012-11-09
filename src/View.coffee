# Provides a simple view class. Implements `Template` for template rendering
# and event delegation.

define ['bags/Template'], (Template) -> \

new Class
    Implements: [Options, Events, Template]
    Binds: ['destroy']

    # Dust.js template name to be used for rendering this view
    template: null

    # Define events for delegation here, of the type below. See
    # `Template.delegateEvents` for more info.
    #
    #     "eventType:cssSelector": "functionName"
    events: {}

    # Reference to the rendered view element
    el: null

    # Model can be passed in to provide the template with data. If so we'll
    # listen to the `destroy` event and destroy this view if the model is
    # ever removed.
    model: null

    # Use this object to store for the template, which can be used as well
    # as a model
    data: {}

    # Define parser funcions to create dynamic template fields or alter
    # existing mode/data attributes for template display only
    parsers: {}

    # If `injectTo` specified then rendered view will be injected into this
    # element
    options:
        injectTo: null
        autoDestroyModel: false
        useKnockout: false

    # On class initialisation any dust templates present will be loaded, the
    # view will be rendered and injected into the passed in container if
    # specified. Rendering also causes events to be delegated.
    #
    # `model` and `el` can be passed in as options, which are then reassigned
    # to the object root. If `el` is specified then this element itself will
    # be the view.
    initialize: (options={}) ->
        @loadAllTemplates()
        for key in ['model', 'el']
            if options[key]?
                @[key] = options[key]
                delete options[key]
        @setOptions options
        if @model? and @options.autoDestroyModel
            @model.addEvent 'destroy', @destroy
        @render options.data, silent: true
        if @options.useKnockout and @model?
            @model.addEvent 'change', (field, value) =>
                @viewModel[field](value)
        if @options.injectTo?
            @inject @options.injectTo
        @

    # Renders the view, if already rendered then replaces the current element
    # whilst keeping the `@el` reference current.
    #
    # * Refs within the template are stored as `@refs`, see `Template.getRefs`
    #
    # * `@events` are delegated
    #
    # * If the view is currently within the dom then a `domupdated` event is
    #   fired on `document`
    #
    render: (data={}, options={}) ->
        el = @_render data
        el.store 'view', @

        if not @el?
            @el = el
        else
            @_replaceCurrentEl el

        @refs = @getRefs el
        @delegateEvents @el, @events

        container = Array.from(el)[0].getParent()
        @_checkDomUpdate container

        @fireEvent 'render' unless options.silent
        el

    # When rendering a model this is called to get a representation suitable
    # for passing into the template. By default this calls `model.toJSON` but
    # can be overridden.
    parseForDisplay: (model) ->
        @model.toJSON()

    # Use to rerender a template partially, can be used to preserve visual
    # state within the template. Doesn't alter events as assumed to be run on
    # a child node.
    #
    # `refs` can either be one ref or an array of many, for instance if we
    # called rerender(['ref1', 'ref2']) then re-rendering will be as such:
    #
    #     <div>
    #         <div>Title</div>
    #         <div class="body">
    #             <ul ref="ref1">
    #             // this will be rerendered //
    #             </ul>
    #             <div>
    #                 <p>hello</p>
    #                 <div ref="ref2">
    #                 // this will be rerendered //
    #                 </div>
    #             </div>
    #         </div>
    #     </div>
    #
    # * Refs within the rerendered nodes are merged into the `@refs` so that
    # they are updated without disturbing the other refs
    #
    # * If within the dom then `domupdated` is still fired on `document`
    rerender: (refs, data={}) ->
        el = @_render data
        Array.from(refs).each (ref) =>
            replaceThis = @refs[ref]
            if not replaceThis
                throw "Cannot find ref #{ref} in template #{@template}"
            newEl = @getRefs(el)[ref]
            Object.merge @refs, @getRefs(newEl)
            @refs[ref].replaces replaceThis

            @_checkDomUpdate newEl.getParent()

    # We have an inject method here so that we can fire `domupdated` on
    # `document` if necessary.
    inject: (container, el=@el) ->
        el.inject container
        @_checkDomUpdate container

    getElement: -> @el.getElement.apply @el, arguments
    getElements: -> @el.getElements.apply @el, arguments

    getViews: (el) ->
        els = el.getChildren()
        els.retrieve('view')

    reorderViews: (collection, rootEl) ->
        views = @getViews rootEl
        for view in views

            dummy = new Element 'div'
            current = $(view)
            desiredIndex = collection.indexOf view.model
            swap = rootEl.getChildren()[desiredIndex]

            dummy.inject current, 'before'
            current.inject swap, 'before'
            swap.inject dummy, 'before'
            dummy.destroy()

    # Very handy method for emptying an element and killing all the views
    # inside it by calling their `destroy` methods
    destroyViews: (el) ->
        views = @getViews(el)
        return if views is null
        views.invoke 'destroy'

    destroy: ->
        if @model? and @options.autoDestroyModel
            @model.removeEvent 'destroy', @destroy
        @el.eliminate 'view'
        @el.destroy()

    toElement: -> @el

    # Private methods
    # ===============

    # Replaces the elements in `@el` with the elements in `el`, being careful
    # to update the references and iterate through array if needed.
    _replaceCurrentEl: (el) ->
        if not instanceOf el, Array
            @el = el.replaces @el
        else
            @el.each (currentEl, idx) =>
                @el[idx] = el[idx].replaces currentEl

    _render: (data={}) ->
        data = @_getTemplateData data
        el = @renderTemplate @template, data

        if @options.useKnockout
            @vm = Object.clone data
            for field, value of @viewModel
                @viewModel[field] = ko.observable(value)
            @feck = ->
                console.log arguments
            ko.applyBindings this, el
        el

    _getTemplateData: (data={}) ->
        data = Object.merge @data, data
        if @model?
            data = Object.merge {}, @parseForDisplay(@model), data
        for fieldName, parser of @parsers
            data[fieldName] = parser.call this, data
        data

    # Recurse back through an elements parents to determine whether it is
    # within the DOM or not, if so fire `domupdated` on `document`
    _checkDomUpdate: (container) ->
        inDom = false
        parent = container
        if parent == document.body
            inDom = true
        while parent = $(parent).getParent()
            inDom = true if parent == document.body
        if inDom
            document.fireEvent 'domupdated', [container]
