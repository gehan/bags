`define(['bags/Events'], function(BagsEvents){`

describe "Events test", ->
    ev = null

    beforeEach ->
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

`})`
