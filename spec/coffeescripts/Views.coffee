Views = null; View = null; Collection = null

done = false
curl ['bags/Views', 'bags/View', 'bags/Collection'],
(_Views, _View, _Collection) ->
    Views = _Views
    View = _View
    Collection = _Collection
    done = true

flatten = (obj) ->
    JSON.encode obj

describe "ViewCollection test", ->
    cv = null; c = null; v = null; View = null; View2 = null
    listEl = null
    beforeEach ->
        waitsFor -> done

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

        c = new Collection([
            id: 1
            name: 'item a'
        ,
            id: 2
            name: 'item d'
        ,
            id: 3
            name: 'item c'
        ])
        c.sortField = 'name'
        listEl = new Element 'ul'

    afterEach ->
        listEl.destroy()

    it 'renders views into collection el', ->
        c.sortField = null
        cv = new Views.CollectionView c, listEl, View2

        children = listEl.getChildren()
        views = children.retrieve 'view'
        expect(views.length).toBe 3
        expect(views[0].model.id).toBe 1
        expect(views[1].model.id).toBe 2
        expect(views[2].model.id).toBe 3

    it 'renders views into collection el sorted if has sortField', ->
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
