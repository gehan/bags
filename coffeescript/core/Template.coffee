# Provides rendering of dust.js templates as well as simple node reference
# tracking and event delegation.
define -> \

new Class
    TEMPLATES: {}
    refs: {}

    # Template Rendering
    # ==================

    # Renders a dust.js template and returns the html nodes. It does not insert
    # these into the DOM.
    #
    # * `templateName`
    #
    #     Name of dust template to use. Dust templates have to be loaded before
    #     the are used, but this will try to load it if it hasn't already. If
    #     however the template uses partials then you need to make sure that
    #     these have all been loaded - see `loadAllTemplates`.
    #
    # * `data`
    #
    #     Data object to be passed into dust template.
    #
    # * `events`
    #
    #     Any events passed in will be delegated from the top-level node(s) -
    #     see `delegateEvents` for syntax.
    renderTemplate: (templateName, data={}, events=null) ->
        rendered = @_renderDustTemplate templateName, data
        els = Elements.from rendered
        @delegateEvents els, events if events?

        if els.length == 1
            els[0]
        else
            els

    # Loads all current dust templates into memory so they can be rendered.
    # This step is essential if partials are used anywhere as they are
    # expected to be in the dust cache already when called.
    #
    # Templates are loaded from either:
    #
    # * `@TEMPLATES` object in this class.
    #
    #   e.g.
    #
    #           TEMPLATES:
    #               "templateName": """
    #               <body>
    #                   <p>Some elements</p>
    #               </body>
    #               """
    #
    # * Any script tags in the current HTML.
    #
    #   e.g.
    #
    #           <script template="templateName" type="text/html">
    #           <body>
    #               <p>I am the internet</p>
    #           </body>
    #           </script>
    #
    loadAllTemplates: ->
        @_loadTemplate(k) for k, v of @TEMPLATES
        @_loadTemplate(k) for k in $$('script[type=text/html]').get('template')


    # Delegates events from the top level node(s) of the passed in `els`.
    #
    # The `events` object is of the following syntax
    #
    #     "eventType:cssSelector": "functionName"
    #
    # e.g.
    #
    #     "click:div.close": "close"
    #     "click:div.delete": "delete"
    #
    # You can chose to stop event propagation upwards and the default action
    # of the elements by default if you wish.
    delegateEvents: (els, events, stopPropagation=false,
            preventDefault=false) ->

        els = Array.from els
        for eventKey, fnName of events
            boundFn = (fnName, event, target) ->
                event.stopPropagation() if stopPropagation
                event.preventDefault() if preventDefault
                @[fnName] event, target
            boundFn = boundFn.bind @, fnName
            for node in els
                @_addDelegatedEvent node, eventKey, boundFn

    # To make saving references to elements with the template easier, if you
    # add the property ref to the element. Running this will then pull those
    # references back into an object.
    #
    # e.g.
    #
    #         <div>
    #             <a href="/somewhere" ref="link">Link</a>
    #             <div ref="title">Title</div>
    #         </div>
    #
    # results in
    #
    #         link: <reference to a Element>
    #         title: <reference to div Element>
    getRefs: (els, ref=null) ->
        refs = {}
        for el in Array.from els
            elRefName = el.get 'ref'
            return el if ref and elRefName == ref
            refs[elRefName] = el if elRefName

            for refEl in el.getElements "*[ref]"
                refName = refEl.get 'ref'
                return refEl if ref and refName == ref

                refs[refName] = refEl

        return refs

    # Pulls out a given ref, calls getRefs directly so just gives a more
    # meaningful name.
    getRef: (el, ref) -> @getRefs el, ref

    # Private methods
    # ===============

    # Calls dust to render the given template. It will try to load the template
    # before rendering.
    #
    # To allow for setting variables it adds the variable `let` to the context
    # and points it to the root so that the context with `let` is effectively
    # unchanged. This means you can do the following to override a variable
    # with a `#let` statement
    #
    #     {#let var1="value" var2="value"}
    #     {/let}
    _renderDustTemplate: (templateName, data={}) ->
        @_loadTemplate templateName
        data = Object.clone data
        data.let = data or 0
        rendered = ""
        dust.render(templateName, data, (err, out) ->
            rendered = out
        )
        return rendered

    # Tries to find and load a dustjs template if it is not already in the
    # cache
    _loadTemplate: (templateName) ->
        if not dust.cache[templateName]?
            compiled = dust.compile @_getTemplate(templateName), templateName
            dust.loadSource compiled

    # Tries to find template in the following order of precedence:
    #
    # 1 - Within the current class in `@TEMPLATES`
    #
    # 2 - Within a JST script tag on the page
    #
    #         <script type="text/html" template="template-name">
    #         <div>{{somestuff}}</div>
    #         </script>
    _getTemplate: (templateName) ->
        template = @TEMPLATES[templateName] if @TEMPLATES?
        return template if template?
        template = document.getElement "script[template=#{templateName}]"
        return template.get('html') if template?
        throw "Cannot find template #{templateName}"

    # Delegates an event from a given element.
    #
    # Mootools uses a more verbose syntax to specify the event.
    #
    # e.g
    #
    #     "click:a.close"
    #
    # in converted to
    #
    #     "click:relay(a.close)"
    _addDelegatedEvent: (el, eventKey, fn) ->
        eventKey = eventKey.split ":"
        mtEvent = "#{eventKey[0]}:relay(#{eventKey[1]})"
        el.addEvent mtEvent, fn
