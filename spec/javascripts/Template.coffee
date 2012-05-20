do ->
    Template = null

    done = false
    curl ['core/Template'], (_Template) ->
        Template = _Template
        done = true

    flatten = (obj) ->
        JSON.encode obj

    describe "Template test", ->
        t = null

        beforeEach ->
            waitsFor -> done
            t = new Template()
            t.TEMPLATES.base3 = """
            <div ref="refa" class="refa">
                <p ref="ref1" class="ref1">Hello there {internet}</p>
                <p ref="ref2" class="ref2">You are the face</p>
            </div>
            """

        it ('find templates in TEMPLATES collection'), ->
            t.TEMPLATES.test = "internet1"
            tpl = t.getTemplate 'test'

            expect(tpl).toBe 'internet1'

        it ('find templates in script tags'), ->
            expect(dust.cache.test1).toBe undefined

            tag = new Element 'script',
                template: 'test2'
                type: 'text/html'
            tag.set 'html', 'oh yeah hello'

            document.body.adopt tag

            tpl = t.getTemplate 'test2'
            expect(tpl).toBe 'oh yeah hello'

        it ('renders a dust template'), ->
            t.TEMPLATES.base1 = """
            <p>Hello there {internet}</p>
            """
            rendered = t._renderDustTemplate 'base1', internet: 'yes'
            expect(rendered).toBe '<p>Hello there yes</p>'

        it ('renders a template into elements'), ->
            t.TEMPLATES.base2 = """
            <div>
                <p>Hello there {internet}</p>
                <p>You are the face</p>
            </div>
            """
            nodes = t.renderTemplate 'base2', internet: 'yes'
            expected = new Element('div').adopt(
                new Element('p', text: 'Hello there yes'),
                new Element('p', text: 'You are the face')
            )
            expect(nodes.innerHTML).toBe expected.innerHTML

        it ('loads all templates to render partials'), ->
            t.TEMPLATES.base4 = """
            <div>
                <p>Yeah</p>
                {>somePartial/}
            </div>
            """
            tag = new Element 'script',
                template: 'somePartial'
                type: 'text/html'
            tag.set 'html', 'hello'
            document.body.adopt tag

            t.loadAllTemplates()
            nodes = t.renderTemplate 'base4', internet: 'yes'
            expect(nodes.innerHTML).toBe "<p>Yeah</p>hello"

        it ('extracts element references'), ->
            nodes = t.renderTemplate 'base3', internet: 'yes'
            refs = t.getRefs nodes

            # Parent ref
            expect(refs.refa).toBe nodes
            # Child refs
            expect(refs.ref1).toBe nodes.getElement ".ref1"
            expect(refs.ref2).toBe nodes.getElement ".ref2"

        it ('extracts single reference'), =>
            nodes = t.renderTemplate 'base3', internet: 'yes'
            refa = t.getRef nodes, 'refa'
            ref1 = t.getRef nodes, 'ref1'

            # Parent ref
            expect(refa).toBe nodes
            # Child refs
            expect(ref1).toBe nodes.getElement ".ref1"

        it ('delegates events to children'), ->
            events =
                "click:p.hello": "hello"
                "click:.hello1": "hello1"

            t.TEMPLATES.base5 = """
            <div>
                <p class="hello"></p>
                <ul>
                    <li>What</li>
                    <li class="hello1">Yeah<li>
                </ul>
            </div>
            """

            fired = {}
            t.hello = ->
                fired.hello = true
            t.hello1 = ->
                fired.hello1 = true

            el = t.renderTemplate 'base5'
            t.delegateEvents el, events

            hello = el.getElement ".hello"
            hello1 = el.getElement ".hello1"

            el.fireEvent 'click', target: hello
            el.fireEvent 'click', target: hello1

            expect(fired.hello).toBe(true)
            expect(fired.hello1).toBe(true)

