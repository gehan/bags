Persist = null

done = false
curl ['bags/Persist'], (_Persist) ->
    Persist = _Persist
    done = true

flatten = (obj) ->
    JSON.encode obj

describe "Persist test", ->
    p = null

    beforeEach ->
        waitsFor -> done
        p = new Persist()


    it 'is the internet', ->
        expect(true).toBe(true)
