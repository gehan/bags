Storage = null

done = false
curl ['bags/Storage'], (_Storage) ->
    Storage = _Storage
    done = true

flatten = (obj) ->
    JSON.encode obj

describe "Storage test", ->
    StorageClass = null
    s = null

    beforeEach ->
        waitsFor -> done
        StorageClass = new Class
            Implements: [Storage]
            url: '/items'
            fetch: (options={}) ->
                storageOptions = Object.merge({eventName: 'fetch'}, options)
                @storage 'read', null, storageOptions

        s = new StorageClass()

    it 'tries to get url from module', ->
        url = s._getUrl 'create'
        expect(url).toBe '/items'

    it 'tries to get url from collection', ->
        s.url = null
        s.collection =
            url: '/collection'
        url = s._getUrl 'create'
        expect(url).toBe '/collection'

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

    it 'doesnt add /@id to read for collections', ->
        s.isCollection = true
        url = s._getUrl 'read'
        expect(url).toBe '/items'

    it 'sets request methods correctly', ->
        s.id = 1

        promise = s.storage 'read'
        expect(promise.request.options.method).toBe 'get'

        promise = s.storage 'create'
        expect(promise.request.options.method).toBe 'post'

        promise = s.storage 'delete'
        expect(promise.request.options.method).toBe 'delete'

        promise = s.storage 'update'
        expect(promise.request.options.method).toBe 'put'

    it 'sends data across to server as json', ->
        model =
            text: 'internet'
            date: '2012-01-01'
        s.storage 'create', model

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
        s.storage 'read'

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
        promise = s.storage 'read'
        promise.when (isSuccess, ret) ->
            success(ret) if isSuccess

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
        promise = s.storage 'read'
        promise.when (isSuccess, ret) ->
            fail(ret) if not isSuccess
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
        s.storage 'read'

        expect(readSpy).toHaveBeenCalled()
        expect(completeSpy).toHaveBeenCalled()
        expect(successSpy).toHaveBeenCalled()

    it 'fires off events when request fails', ->
        setNextResponse
            status: 404

        failSpy = jasmine.createSpy 'fail spy'
        s.addEvent 'readFailure', failSpy
        s.isCollection = true
        s.storage 'read'
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
        s.storage 'read', page: 1, action: 'A'
        req = mostRecentAjaxRequest()
        expect(req.url).toBe '/items?page=1&action=A'
