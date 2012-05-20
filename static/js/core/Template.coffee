###
Class to allow convenient rendering of mustache templates
Ideally used as a mixin to add this ability to classes but can be used as a standalone
###
define  ->

    new Class
        TEMPLATES: {}
        refs: {}

        # Loads all current dust templates into memory so they can be rendered
        # This step is essential if partials are used anywhere are they are expected
        # to be in the dust cache already when called
        loadAllTemplates: ->
            @_loadTemplate(k) for k, v of @TEMPLATES
            @_loadTemplate(k) for k in $$('script[type=text/html]').get('template')

        # Render dust template
        renderTemplate: (templateName, data={}, events=null) ->
            rendered = @_renderDustTemplate templateName, data
            els = Elements.from rendered
            @delegateEvents els, events if events?

            if els.length == 1
                els[0]
            else
                els

        # To make saving references to elements with the template easier if you add the property
        # ref to the element then this will pull those references back into an object, e.g.
        # <a href="/somewhere" ref="link">Link</a>
        # refs = link: <reference to A Element>
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

        getRef: (el, ref) -> @getRefs el, ref

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

        # Delegate events from this class
        delegateEvents: (el, events, preventDefault) ->
            els = Array.from el
            for eventKey, fnName of events
                boundFn = (fnName, event, target) ->
                    event.preventDefault() if preventDefault
                    @[fnName] event, target
                boundFn = boundFn.bind @, fnName
                for node in els
                    @_addDelegatedEvent node, eventKey, boundFn

        _addDelegatedEvent: (el, eventKey, fn) ->
            eventKey = eventKey.split ":"
            mtEvent = "#{eventKey[0]}:relay(#{eventKey[1]})"
            el.addEvent mtEvent, fn
