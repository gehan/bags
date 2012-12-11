BagsEvents = null

done = false
curl ['bags/Events'], (_Events) ->
    BagsEvents = _Events
    done = true

flatten = (obj) ->
    JSON.encode obj

describe "Events test", ->
    ev = null

    beforeEach ->
        waitsFor -> done
        ev = new BagsEvents()

    it "provides 'any' event which is fired whenever any event is fired", ->
        anySpy = jasmine.createSpy 'anyEvent'
        otherSpy = jasmine.createSpy 'anyEvent'
        ev.addEvent 'any', anySpy
        ev.addEvent 'balls', otherSpy
        ev.fireEvent 'balls', 'what'
        expect(anySpy).toHaveBeenCalledWith 'balls', 'what'
        expect(otherSpy).toHaveBeenCalledWith 'what'

    it "if 'any' event fired directly then only fires it once", ->
        anySpy = jasmine.createSpy 'anyEvent'
        ev.addEvent 'any', anySpy
        ev.fireEvent 'any'
        expect(anySpy.calls.length).toBe 1
