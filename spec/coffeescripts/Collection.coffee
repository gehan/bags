Collection = null

done = false
curl ['bags/Collection'], (_Collection) ->
    Collection = _Collection
    done = true

flatten = (obj) ->
    JSON.encode obj

describe "Collection test", ->
    col = null

    beforeEach ->
        waitsFor -> done
        col = new Collection()

    it "listens to events on model and re-fires on collection", ->
        modelSpy = jasmine.createSpy 'modelEvent'
        col.addEvent 'modelEvent', modelSpy

        col.add id: 12, text: 'arse'
        model = col[0]

        model.fireEvent 'modelEvent', 'yeah mate'
        expect(modelSpy).toHaveBeenCalledWith model, 'yeah mate'
