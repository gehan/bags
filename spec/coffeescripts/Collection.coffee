`define(['bags/Collection', 'bags/Model'], function(Collection, Model){`

flatten = (obj) -> JSON.encode obj

describe "Collection test", ->
    col = null

    beforeEach ->
        col = new Collection()

    it "listens to events on model and re-fires on collection", ->
        modelSpy = jasmine.createSpy 'modelEvent'
        col.addEvent 'modelEvent', modelSpy

        col.add id: 12, text: 'arse'
        model = col[0]

        model.fireEvent 'modelEvent', 'yeah mate'
        expect(modelSpy).toHaveBeenCalledWith model, 'yeah mate'


    it "separates sort and directioni ascending", ->
        [field, descending] = col._parseSort 'hello'

        expect(field).toBe 'hello'
        expect(descending).toBe false

    it "separates sort and direction descending", ->
        [field, descending] = col._parseSort '-hello'

        expect(field).toBe 'hello'
        expect(descending).toBe true

    it 'sorts collection on field, ascending', ->

        models = [
            id: 1
            text: 'c'
        ,
            id: 2
            text: 'a'
        ,
            id: 3
            text: 'b'
        ]

        col = new Collection(models)
        col.sortBy('text')

        expect(col[0].get('text')).toBe 'a'
        expect(col[1].get('text')).toBe 'b'
        expect(col[2].get('text')).toBe 'c'

    it 'sorts collection on field, descending', ->

        models = [
            id: 1
            text: 'c'
        ,
            id: 2
            text: 'a'
        ,
            id: 3
            text: 'b'
        ]

        col = new Collection(models)
        col.sortBy('-text')

        expect(col[0].get('text')).toBe 'c'
        expect(col[1].get('text')).toBe 'b'
        expect(col[2].get('text')).toBe 'a'

`})`
