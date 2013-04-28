`define(['bags/Api'], function (Api) {`

describe "Api test", ->
    ApiClass = null
    s = null

    beforeEach ->
        ApiClass = new Class
            Implements: [Api]
            url: '/items'
            fetch: (options={}) ->
                apiOptions = Object.merge({eventName: 'fetch'}, options)
                @api 'read', null, apiOptions

        s = new ApiClass()

    it 'tries to get url from module', ->
        url = s._getUrl 'create'
        expect(url).toBe '/items'

    it 'tries to get url from collection', ->
        s.url = null
        s.collection =
            url: '/collection'
        url = s._getUrl 'create'
        expect(url).toBe '/collection'

    it 'gets request methods correctly', ->
        expect(s._getRequestMethod 'create').toBe 'post'
        expect(s._getRequestMethod 'read').toBe 'get'
        expect(s._getRequestMethod 'update').toBe 'put'
        expect(s._getRequestMethod 'delete').toBe 'delete'
        expect(s._getRequestMethod 'list').toBe 'get'
        expect(s._getRequestMethod 'archive').toBe 'post'

    it 'throws error if no url found', ->
        errorThrown = false
        s.url = null
        try
            url = s._getUrl 'create'
        catch err
            errorThrown = true
        expect(errorThrown).toBe true

    it 'adds /@id to other methods', ->
        s.id = 1
        url = s._getUrl 'delete'
        expect(url).toBe '/items/1'

        url = s._getUrl 'read'
        expect(url).toBe '/items/1'

        url = s._getUrl 'update'
        expect(url).toBe '/items/1'

    it 'append operation name to url if unknown', ->
        s.id = 1
        url = s._getUrl 'archive'
        expect(url).toBe '/items/1/archive'

    it 'doesnt add /@id to read for collections, adds /', ->
        s.isCollection = true
        url = s._getUrl 'read'
        expect(url).toBe '/items/'

    it 'sends data across to server as json', ->
        model =
            text: 'internet'
            date: '2012-01-01'
        s.api 'create', model

        req = mostRecentAjaxRequest()
        expect(req.params).toBe Object.toQueryString(model: JSON.encode(model))

    it 'parses response data correctly on success', ->
        response =
            status: 200
            responseText: flatten
                success: true
                data:
                    id: 2

        setNextResponse response

        spyOn(s, 'isSuccess').andCallThrough()
        spyOn(s, 'parseResponse').andCallThrough()

        s.isCollection = true
        s.api 'read'

        expect(s.isSuccess).toHaveBeenCalled()
        lastCall = flatten s.parseResponse.mostRecentCall.args[0]
        expect(lastCall).toBe(response.responseText)

    it 'executes success callback if passed through', ->
        response =
            status: 200
            responseText: flatten
                success: true
                data:
                    id: 2

        setNextResponse response

        success = jasmine.createSpy 'succes cb'
        s.isCollection = true

        promise = s.api 'read'
        promise.then (ret) ->
            success(ret)

        waitsFor ->
            success.wasCalled == true

        runs ->
            lastCall = success.mostRecentCall.args[0]
            expect(lastCall).toBeObject(id: 2)

    it 'executes failure callback if passed through', ->
        response =
            status: 200
            responseText: flatten
                success: false
                error: 'its rubbish'

        setNextResponse response

        fail = jasmine.createSpy 'fail cb'

        s.isCollection = true
        promise = s.api 'read'
        promise.then (->), (reason) ->
            fail(reason)

        waitsFor ->
            fail.wasCalled == true

        runs ->
            expect(fail).toHaveBeenCalledWith('its rubbish')


    it 'fires off events when request starts/completes/succeeds', ->
        setNextResponse
            status: 200
            responseText: flatten
                success: true
                data:
                    id: 2

        readSpy = jasmine.createSpy 'start spy'
        completeSpy = jasmine.createSpy 'complete spy'
        successSpy = jasmine.createSpy 'success spy'

        s.addEvent 'readStart', readSpy
        s.addEvent 'readComplete', completeSpy
        s.addEvent 'readSuccess', successSpy

        s.isCollection = true
        s.api 'read'

        expect(readSpy).toHaveBeenCalled()
        expect(completeSpy).toHaveBeenCalled()
        expect(successSpy).toHaveBeenCalled()

    it 'fires off events when request fails', ->
        setNextResponse
            status: 404

        failSpy = jasmine.createSpy 'fail spy'
        s.addEvent 'readFailure', failSpy
        s.isCollection = true
        s.api 'read'
        expect(failSpy).toHaveBeenCalled()

    it 'fires off failure events with custom name', ->
        setNextResponse
            status: 404

        failSpy = jasmine.createSpy 'fail spy'
        s.isCollection = true
        s.addEvent 'fetchFailure', failSpy
        s.fetch()
        expect(failSpy).toHaveBeenCalled()

    it 'fires no events if silent passed in', ->
        setNextResponse
            status: 404

        failSpy = jasmine.createSpy 'fail spy'
        s.isCollection = true
        s.addEvent 'fetchFailure', failSpy
        s.fetch silent: true
        expect(failSpy).wasNotCalled()

    it 'sends qs data to read command', ->
        s.isCollection = true
        s.api 'read', page: 1, action: 'A'
        req = mostRecentAjaxRequest()
        expect(req.url).toBe '/items/?page=1&action=A'

`})`
