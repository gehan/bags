`define(['bags/Views', 'bags/View', 'bags/Collection'],
function(Views, View, Collection) {`

describe "ViewCollection test", ->
    cv = null; c = null; v = null; View2 = null
    EmptyView = null
    listEl = null
    beforeEach ->
        dust.cache = {}
        View2 = new Class
            Extends: View
            TEMPLATES:
                test: """
                    <li>{name}</li>
                """
            template: 'test'
            initialize: ->
                ret = @parent.apply this, arguments
                @model.addEvent 'change', => @render()
                ret

        EmptyView = new Class
            Extends: View
            TEMPLATES:
                empty: "<li>I'm empty</li>"
                empty2: "<li>I'm empty too</li>"
            template: 'empty'

        c = new Collection([
            id: 1
            name: 'item a'
        ,
            id: 2
            name: 'item z'
        ,
            id: 3
            name: 'item c'
        ], sortField: 'name')
        listEl = new Element 'ul'

    afterEach ->
        listEl.destroy()

    it 'renders views into collection el', ->
        cv = new Views.CollectionView c, listEl, View2

        children = listEl.getChildren()
        views = children.retrieve 'view'
        expect(views[0].model.id).toBe 1
        expect(views[1].model.id).toBe 3
        expect(views[2].model.id).toBe 2

    it 'adds new element into list in order', ->
        cv = new Views.CollectionView c, listEl, View2
        c.create id: 4, name: 'item b'

        children = listEl.getChildren()
        views = children.retrieve 'view'
        expect(views[1].model.id).toBe 4

    it 'maintains order after model view render, e.g. save', ->
        cv = new Views.CollectionView c, listEl, View2

        children = listEl.getChildren()
        views = children.retrieve 'view'
        view = views[2]
        model = view.model
        id = model.id

        model.set name: 'a top of list'

        children = listEl.getChildren()
        views = children.retrieve 'view'
        expect(views[0].model.id).toBe id

    it 'removes all collection events on destroy', ->
        cv = new Views.CollectionView c, listEl, View2
        cv.destroy()
        c.create id: 4, name: 'item b'

    it 'kills els on destroy', ->
        cv.destroy()
        children = listEl.getChildren()
        views = children.retrieve 'view'

        expect(children.length).toBe 0

    it 'resorts collection on element render', ->
        cv = new Views.CollectionView c, listEl, View2

        children = listEl.getChildren()
        views = children.retrieve 'view'
        expect(views[0].model.id).toBe 1
        expect(views[1].model.id).toBe 3
        expect(views[2].model.id).toBe 2

        m = views[2].model
        m.set 'name', 'am first'
        views[2].render()

        children = listEl.getChildren()
        views = children.retrieve 'view'
        expect(views[0].model.id).toBe 2
        expect(views[1].model.id).toBe 1
        expect(views[2].model.id).toBe 3

    it 'shows emptyviewitem if collection empty', ->
        listEl = new Element('ul')
        c = new Collection [{id:1, name: 'feck'}]
        cv = new Views.CollectionView c, listEl, View2,
            itemEmptyView: EmptyView

        listEl.inject document.body

        expect(listEl.getChildren().length).toBe 1
        expect(listEl.getChildren()[0].get 'text').toBe 'feck'

        model = c[0]
        c._remove model

        expect(listEl.getChildren().length).toBe 1
        expect(listEl.getChildren()[0].get 'text').toBe "I'm empty"

        c.create {id:2, name: 'internet'}

        expect(listEl.getChildren().length).toBe 1
        expect(listEl.getChildren()[0].get 'text').toBe 'internet'

`})`
