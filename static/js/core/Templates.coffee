###
Class to allow convenient rendering of mustache templates
Ideally used as a mixin to add this ability to classes but can be used as a standalone
###
Templates = new Class

    TEMPLATES: {}
    refs: {}

    # Element
    el: null

    # Events to be added via delegation
    events: {}

    # Loads all current dust templates into memory so they can be rendered
    # This step is essential if partials are used anywhere are they are expected
    # to be in the dust cache already when called
    loadAllTemplates: ->
        @_loadTemplate(k) for k,v of @TEMPLATES
        @_loadTemplate(k) for k in $$('script[type=text/html]').get('template')

    # Render dust template
    renderTemplate: (templateName, data={}, events=null) ->
        Timer.start 'render'
        rendered = @_renderDustTemplate templateName, data
        Timer.add 'render'

        Timer.start 'elementsFrom'
        els = Elements.from rendered
        Timer.add 'elementsFrom'

        @addChildEvents els, events if events?

        if els.length == 1
            els[0]
        else
            els

    # Adds events to passed in elements by getting parent and adding events
    # as per the selector. Add like the below example
    # events = {
    #   'click:div.submit': ->
    #       consol.log "I've been clicked"
    # }
    addChildEvents: (els, events={}) ->
        # Should always have a parent, even elements that aren't inserted
        # have a div parent
        if typeOf(els) in ['array','elements']
            el = els[0]
        else
            el = els
        parent = el.getParent()
        for eventKey, fn of events
            [eventType, selector] = eventKey.split ':'
            parent.getElements(selector).addEvent eventType, fn


    # Checks class for events to delegate
    initDelegatedEvents: ->
        if not @childEventContainer?
            throw "Must define childEventContainer to delegate events"
        # Child container events
        for eventKey, fnName of @childEvents
            boundFn = (fnName, event, target) ->
                if target.hasClass 'el-root'
                    rootEl = target
                else
                    rootEl = target.getParent '.el-root'
                return if not rootEl?
                childObj = rootEl.retrieve 'obj'
                event.preventDefault() if target.get('tag') == 'a'
                fn = childObj[fnName]
                fn.call childObj, event, target
            boundFn = boundFn.bind @, fnName
            @childEventContainer.addDelegatedEvent eventKey, boundFn

    initEvents: (el=@el) ->
        for eventKey, fnName of @events
            boundFn = (fnName, event, target) ->
                event.preventDefault()
                @[fnName] event, target
            boundFn = boundFn.bind @, fnName
            el.addDelegatedEvent eventKey, boundFn

    # To make saving references to elements with the template easier if you add the property
    # ref to the element then this will pull those references back into an object, e.g.
    # <a href="/somewhere" ref="link">Link</a>
    # refs = link: <reference to A Element>
    getRefs: (els, ref=null) ->
        Timer.start 'getRefs'

        refs = {}
        for el in Array.from els
            elRefName = el.get 'ref'
            return el if ref and elRefName == ref
            refs[elRefName] = el if elRefName

            for refEl in el.getElements "*[ref]"
                refName = refEl.get 'ref'
                return el if ref and refName == ref

                refs[refName] = refEl
                if refName == 'fbTag' then FBParse.queue(refs.fbTag)

        Timer.add 'getRefs'
        return refs

    getRef: (el, ref) ->
        @getRefs el, ref

    render: (data={}, template=@template) ->
        el = @renderTemplate template, data
        if @el then el.replaces @el
        @el = el
        Object.merge @refs, @getRefs(el)
        el.store 'obj', @
        @initEvents el
        @fireEvent 'render'
        el

    rerender: (refs, data, template=@template) ->
        el = @renderTemplate template, data
        Array.from(refs).each (ref) =>
            replaceThis = @refs[ref]
            if not replaceThis
                throw "Cannot find ref #{ref} in template #{template}"
            newEl = @getRefs(el)[ref]
            Object.merge @refs, @getRefs(newEl)
            @refs[ref].replaces replaceThis
        el

    _renderDustTemplate: (templateName, data={}) ->
        @_loadTemplate templateName
        data = Object.clone data
        data.let = data or 0
        rendered = ""
        dust.render(templateName, data, (err, out) ->
            rendered = out
        )
        return rendered

    _loadTemplate: (templateName) ->
        if not dust.cache[templateName]?
            compiled = dust.compile @getTemplate(templateName), templateName
            dust.loadSource compiled

    # Tries to find template in the following order of precedence:
    # 1 - Within the current class in TEMPLATES, e.g. when using as mixin
    # 2 - Within a JST script tag on the page
    # The latter is inserted by using django-mustachejs tags. Compiles and returns
    # if not already cached
    # Templates should be stored as follows if using a JST script tag
    # <script type="text/html" template="template-name">
    # <div>{{somestuff}}</div>
    # </script>
    getTemplate: (templateName) ->
        template = @TEMPLATES[templateName] if @TEMPLATES?
        return template if template?
        template = document.getElement "script[template=#{templateName}]"
        return template.get('html') if template?
        throw "Cannot find template #{templateName}"

    toElement: -> @el
