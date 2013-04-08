`define(['bags/View'], function (View) {`

flatten = (obj) ->
    JSON.encode obj

describe "View test", ->
    v = null

    beforeEach ->
        View.implement
            template: 'test'
            TEMPLATES:
                test: "<div ref='div'><p>yes</p></div>"
        v = new View()

    it ('renders template on init'), ->
        View.implement
            template: 'test1'
            TEMPLATES:
                test1: """
                <div>
                    <p>Hello</p>
                    <p>What</p>
                </div>
                """
        v = new View()

        el = $ v
        expect(el.innerHTML).toBe "<p>Hello</p><p>What</p>"

    it ('delegates events and saves refs on render'), ->
        events =
            "click:p": "someThing"
        View.implement
            events: events
            template: 'test'
            TEMPLATES:
                test: "<div ref='div'><p>yes</p></div>"
        v = new View()
        spyOn(v, 'delegateEvents')
        v.render()
        expect(v.delegateEvents).toHaveBeenCalledWith $(v), events
        expect(v.refs.div).toBe $(v)

    it ('injects element into container if passed in'), ->
        container = new Element('div.container')
        v = new View
            injectTo: container

        expect(container.getFirst()).toBe $(v)

    it ('replaces element reference when rendering again'), ->
        container = new Element('div.container')
        v = new View
            injectTo: container

        v.render()
        expect(container.getFirst()).toBe $(v)

    it ('replaces element reference when rendering again, array'), ->
        container = new Element('div.container')
        View.implement
            template: 'test3'
            TEMPLATES:
                test3: "<div></div><div></div>"
        v = new View
            injectTo: container

        v.render()
        expect(container.getChildren()[0]).toBe $(v)[0]
        expect(container.getChildren()[1]).toBe $(v)[1]

    it ('fires dom updated method if inserted into dom'), ->
        elContainer = null
        document.addEvent 'domupdated', (_container) ->
            elContainer = _container

        container = new Element('div.container')
        v = new View
            injectTo: container

        expect(elContainer).toBe null

        document.body.adopt container

        v.render()
        expect(elContainer).toBe container

        container.destroy()

    it ('partially rerenders and keeps existing refs'), ->
        View.implement
            template: 'test4'
            TEMPLATES:
                test4: """
                <ul ref="what">
                    <li ref="hello">
                        {text}
                    </li>
                    <li ref="yes">{text}</li>
                    <li ref="no">No</li>
                </ul>
                """
        v = new View

        v.render text: 'internet'
        expect($(v).innerHTML).toBe("""<li ref="hello">internet</li>""" +
            """<li ref="yes">internet</li><li ref="no">No</li>""")

        what = v.refs.what
        hello = v.refs.hello
        ayes = v.refs.yes
        ano = v.refs.no

        v.rerender ['hello', 'yes'], text: 'interface'

        expect(what).toBe v.refs.what
        expect(hello).toNotBe v.refs.hello
        expect(ayes).toNotBe v.refs.yes
        expect(ano).toBe v.refs.no
        expect($(v).innerHTML).toBe("""<li ref="hello">interface</li>""" +
            """<li ref="yes">interface</li><li ref="no">No</li>""")

    it ('allows customer parse functions for display'), ->
        v.parsers =
            fullName: (data) ->
                data.firstName + ' ' + data.lastName
        v.data =
            firstName: 'Gehan'
            lastName: 'Gonsalkorale'
        data = v._getTemplateData()
        expect(data.fullName).toBe 'Gehan Gonsalkorale'

`})`
