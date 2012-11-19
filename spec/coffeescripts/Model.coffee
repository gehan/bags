Model = null
Collection = null

done = false
curl ['bags/Model', 'bags/Collection'], (_Model, _Collection) ->
    window.Model = _Model
    window.Collection = _Collection
    Model = _Model
    Collection = _Collection
    done = true

flatten = (obj) ->
    JSON.encode obj

describe "Model test", ->
    m = null

    beforeEach ->
        waitsFor -> done
        m = new Model {},
            url: '/items'

    it 'gets/sets attributes', ->
        expect(m.has 'test').toBe false
        expect(m.get 'test').toBe undefined

        m.set 'test', 'internet'
        expect(m.has 'test').toBe true
        expect(m.get 'test').toBe 'internet'

    it 'sets attributes silently', ->
        fired = false
        m.addEvent 'change', -> fired = true
        m.set 'more', 'fecker', silent: true

        expect(fired).toBe false

    it 'sets multiple attributes', ->
        m.set
            test: 'internet2'
            more: 'fecker'

        expect(m.get 'test').toBe 'internet2'
        expect(m.get 'more').toBe 'fecker'

    it 'sets multiple attributes silently', ->
        fired = false
        m.addEvent 'change', -> fired = true
        m.set
            test: 'internet2'
            more: 'fecker'
        , silent: true

        expect(fired).toBe false

    it 'gets/sets attributes', ->
        obj = {k:'val'}
        m = new Model key: obj
        expect(m.get 'key').toBeObject obj

    it 'fires change event on attr change', ->
        changed = {}
        m.addEvent 'change', (key, value) ->
            changed[key] = value

        changedAKey = null
        m.addEvent 'change:aKey', (value) ->
            changedAKey = value

        m.set
            aKey: 'internet'
            bKey: 'test'

        expect(changed.aKey).toBe 'internet'
        expect(changedAKey).toBe 'internet'
        expect(changed.bKey).toBe 'test'

    it 'fires change event only if attr has changed value', ->
        changeSpy = jasmine.createSpy 'change'
        m = new Model field: 'value'
        m.addEvents change: changeSpy
        m.set field: 'value'
        expect(changeSpy).wasNotCalled()

    it 'sets defaults silently when initializing model', ->
        Model.implement
            defaults:
                type: 'text'
                internet: 2
                override: 'feck'

        changeFired = false
        m = new Model {override: 'arse'},
            onChange: ->
                changeFired = true

        expect(m.get 'type').toBe 'text'
        expect(m.get 'internet').toBe 2
        expect(m.get 'override').toBe 'arse'

        expect(changeFired).toBe false

        Model.implement defaults: null
        Model.implement defaults: {}

    it 'inits types correctly', ->
        Model.implement
            fields:
                aDate: 'Date'
                aModel: -> Model

        m = new Model
            aDate: '2012/01/01 02:02'
            aModel: {feck: 'arse'}

        expect(instanceOf m.get('aDate'), Date).toBe true
        expect(m.get('aDate').format '%Y/%m/%d %H:%M').toBe '2012/01/01 02:02'

        expect(instanceOf m.get('aModel'), Model).toBe true
        expect(m.get('aModel').get 'feck').toBe 'arse'

        Model.implement fields: null
        Model.implement fields: {}

    it 'inits type within arrays correctly', ->
        Model.implement
            fields:
                aDate: 'Date'

        m = new Model
            aDate: ['2012/01/01 02:02', '2012/01/01 02:03']

        expect(m.get('aDate')[0].format '%Y/%m/%d %H:%M').toBe '2012/01/01 02:02'
        expect(m.get('aDate')[1].format '%Y/%m/%d %H:%M').toBe '2012/01/01 02:03'

        Model.implement fields: null
        Model.implement fields: {}

    it 'sets id attribute when passed in', ->
        m = new Model id: 12

        expect(m.get 'id').toBe(12)
        expect(m.id).toBe(12)

    it 'sets custom id attribute when passed in', ->
        Model.implement
            idField: "_id"

        m = new Model _id: 12

        expect(m.get '_id').toBe(12)
        expect(m.id).toBe(12)

        Model.implement
            idField: "id"

    it 'jsons basic key values', ->
        vals =
            key1: 'value1'
            key2: 'value2'
            key3: ['value3', 'value4']

        m = new Model vals

        expect(flatten m.toJSON()).toBe(flatten vals)

    it 'calls toJSON function on jsonable object', ->
        s = toJSON: ->
        spyOn(s, 'toJSON').andReturn 'value4'
        vals =
            key1: 'value3'
            key2: s
            key3: [s,s,s]

        m = new Model vals
        expect(flatten m.toJSON()).toBe flatten
            key1: 'value3'
            key2: 'value4'
            key3: ['value4', 'value4', 'value4']

    it 'calls key-specific json methos on toJSON', ->
        Mdl = new Class
            Extends: Model
            jsonName: (value) ->
                "json_#{value}"

        vals =
            key1: 'value1'
            name: 'value2'

        m = new Mdl vals
        expect(flatten m.toJSON()).toBe flatten
            key1: 'value1'
            name: 'json_value2'

    it 'gives child model reference to itself', ->
        Mdl = new Class
            Extends: Model
            fields:
                subModel: Model

        vals =
            key1: 'value1'
            subModel: {key2: 'value2'}

        mdl = new Mdl vals
        subModel = mdl.get 'subModel'
        window.f = mdl

        expect(subModel._parent).toBe mdl

    it 'instantiates a collection if set as type, adds to collections', ->
        Cll = new Class
            Extends: Collection
            model: Model

        Mdl = new Class
            Extends: Model
            fields:
                subCollection: Cll

        values = [
            {id: 1, key: 'value'}
            {id: 2, key: 'value'}
        ]

        vals = subCollection: values

        addedKey = null
        addedCollection = null
        mdl = new Mdl vals,
            onAddCollection: (key, collection) ->
                addedKey = key
                addedCollection = collection

        expect(instanceOf mdl.collections.subCollection, Cll).toBe true
        expect(instanceOf mdl.get('subCollection'), Cll).toBe true

        expect(flatten mdl.get('subCollection').toJSON()).toBe(flatten values)

        mdl.set 'subCollection', values

        expect(addedKey).toBe 'subCollection'
        expect(addedCollection.toJSON()).toBeObject \
            mdl.get('subCollection').toJSON()

    it 'sends create request to storage', ->
        attrs =
            value1: 'key1'
            value2: 'key2'

        m.set attrs

        expect(m.isNew()).toBe true

        deferred = Q.defer()
        spyOn(m, 'storage').andReturn deferred.promise

        saved = false
        m.save().then (ret) -> saved = true
        deferred.resolve id: 2

        waitsFor ->
            saved == true

        runs ->
            expect(saved).toBe true
            lastCall = m.storage.mostRecentCall.args
            expect(lastCall).toBeObject(['create', attrs, eventName: 'save' ])
            expect(m.id).toBe 2

    it 'sends update request to storage', ->
        attrs =
            id: 2
            value1: 'key1'
            value2: 'key2'

        m.set attrs

        expect(m.isNew()).toBe false

        deferred = Q.defer()
        spyOn(m, 'storage').andReturn deferred.promise

        promise2 = m.save()

        lastCall = m.storage.mostRecentCall.args
        expect(lastCall).toBeObject(['update', attrs, eventName: 'save' ])

    it 'save accepts values, doesnt update until server response', ->
        m.set 'action', 'face'

        setNextResponse
            status: 200
            responseText: flatten
                success: true

        # Track change event after request has completed
        saveCompleted = false
        changeCalledBeforeSave = false
        m.addEvent 'saveComplete', ->
            saveCompleted = true
        m.addEvent 'change', ->
            changeCalledBeforeSave = true if not saveCompleted

        m.save 'action', 'deleted'

        req = mostRecentAjaxRequest()
        requestData =
            model: JSON.encode(action: 'deleted')
        expect(req.params).toBe Object.toQueryString(requestData)
        expect(changeCalledBeforeSave).toBe false


    it 'save accepts values, updates immediately if requested', ->
        changeCalled = false
        m.addEvent 'change', (key, value) ->
            changeCalled = key == 'internet' and value == 'face'

        setNextResponse
            status: 200
            responseText: flatten
                success: true

        m.save 'internet', 'face', dontWait: true

        expect(changeCalled).toBe true

    it 'save accepts values, but keeps id if existing model', ->
        m.set id: 1

        deferred = Q.defer()
        spyOn(m, 'storage').andReturn deferred.promise

        promise2 = m.save internet: 'yes'

        lastCall = m.storage.mostRecentCall.args
        expect(lastCall).toBeObject(['update', {id: 1, internet: 'yes'}, eventName: 'save' ])

    it 'save accepts value obj', ->
        m.set 'action', 'face'
        m.save action: 'deleted', feck: 'arse'

        req = mostRecentAjaxRequest()
        requestData =
            model: JSON.encode(action: 'deleted', feck: 'arse')
        expect(req.params).toBe Object.toQueryString(requestData)

    it 'save works with types', ->
        Mdl = new Class
            Implements: Model
            url: '/items'
            fields:
                aDate: Date

        m = new Mdl
        changeCalled = false
        m.addEvent 'change', ->
            changeCalled = true
        dte = new Date('2012-01-01')

        m.save {aDate: dte}

        req = mostRecentAjaxRequest()
        requestData =
            model: JSON.encode(aDate: dte.toJSON())
        expect(req.params).toBe Object.toQueryString(requestData)
        expect(changeCalled).toBe false

    it 'save accepts callback for success', ->
        success = jasmine.createSpy 'success callback'

        deferred = Q.defer()
        spyOn(m, 'storage').andReturn deferred.promise

        m.save().then success

        deferred.resolve id: 3

        waitsFor ->
            success.wasCalled == true

        runs ->
            expect(success).toHaveBeenCalled()
            calledWith = flatten(success.mostRecentCall.args)
            expect(calledWith).toBe flatten([id: 3])

    it 'save accepts callback for failure', ->
        fail = jasmine.createSpy 'fail callback'

        deferred = Q.defer()
        spyOn(m, 'storage').andReturn deferred.promise

        m.save().then (->), fail
        deferred.reject 'shiit'

        waitsFor ->
            fail.wasCalled == true

        runs ->
            expect(fail).toHaveBeenCalledWith 'shiit'

    it 'destroy send delete request to server', ->
        success = jasmine.createSpy 'success callback'
        destroy = jasmine.createSpy 'destroy event'

        m.id = 1
        m.addEvent 'destroy', destroy

        deferred = Q.defer()
        spyOn(m, 'storage').andReturn deferred.promise

        m.destroy().then success
        deferred.resolve 'yeah mate'

        waitsFor ->
            success.wasCalled == true

        runs ->
            lastCall = m.storage.mostRecentCall.args
            expect(lastCall).toBeObject(['delete', null, eventName: 'destroy' ])

            expect(success).toHaveBeenCalled()
            expect(destroy).toHaveBeenCalled()

    it 'allows custom get methods', ->
        m.properties =
            fullName:
                get: ->
                    "#{@get 'firstName'} #{@get 'lastName'}"
        m.set
            firstName: 'Gehan'
            lastName: 'Gonsalkorale'
        expect(m.get 'fullName').toBe 'Gehan Gonsalkorale'

    it 'allows custom set methods', ->
        m.properties =
            fullName:
                set: (value) ->
                    split = value.split " "
                    @set
                        firstName: split[0]
                        lastName: split[1]
                    , silent: true
        m.set
            fullName: 'Gehan Gonsalkorale'
        expect(m.get 'firstName').toBe 'Gehan'
        expect(m.get 'lastName').toBe 'Gonsalkorale'

    it 'sets when validator passes', ->
        m.validators =
            login: (value) ->
                if value.length < 4
                    return 'Login must be at least 4 characters'
                else
                    return true

        m.set 'login', 'fecker'
        expect(m.get 'login').toBe 'fecker'

    it 'rejects set when validator fails', ->
        m.validators =
            login: (value) ->
                if value.length < 4
                    return 'Login must be at least 4 characters'
                else
                    return true

        m.set 'login', 'fec'
        expect(m.get 'login').toBe undefined

    it 'fires events when validator fails', ->
        m.validators =
            login: (value) ->
                if value.length < 4
                    return 'Login must be at least 4 characters'
                else
                    return true

        errorSpy = jasmine.createSpy 'errorSpy'
        errorLoginSpy = jasmine.createSpy 'errorLoginSpy'
        m.addEvents
            error: errorSpy
            'error:login': errorLoginSpy
        m.set 'login', 'fec'

        expect(errorLoginSpy).toHaveBeenCalledWith 'fec',
            'Login must be at least 4 characters'
        expect(errorSpy).toHaveBeenCalledWith 'login', 'fec',
            'Login must be at least 4 characters'

    it 'doesnt set any values if any field validations fail', ->
        m.fields =
            collection: Collection
        m.validators =
            login: (value) ->
                if value.length < 4
                    return 'Login must be at least 4 characters'
                else
                    return true

        expect(m.get 'login').toBe undefined
        expect(m.get 'field1').toBe undefined
        expect(m.get 'field2').toBe undefined
        expect(m.get 'collection').toBe undefined
        expect(m.collections.collection).toBe undefined

        result = m.set
            login: 'int'
            field1: 'feck'
            field2: 'arse'
            collection: [{id:1}, {id:2}]

        expect(m.get 'login').toBe undefined
        expect(m.get 'field1').toBe undefined
        expect(m.get 'field2').toBe undefined
        expect(m.get 'collection').toBe undefined
        expect(m.collections.collection).toBe undefined
        expect(result).toBe false

    it 'jsons dates with correct format, doesnt used own stupid internal method', ->
        m.fields =
            date: Date
        m.set
            date: '2012-08-01 00:00:00'
        json = m.toJSON()
        expect(json.date).toBe "2012-08-01T00:00:00.000Z"

    it 'tracks if model is dirty or clean', ->
        expect(m.isDirty()).toBe false
        m.set name: 'mate'
        expect(m.isDirty()).toBe true

    it 'is clean when initialized', ->
        m = new Model
            name: 'internet'
            gear: true
        expect(m.isDirty()).toBe false

    it 'is clean after fetch', ->
        success = jasmine.createSpy()
        m = new Model {id: 1}, url: '/items'

        deferred = Q.defer()
        spyOn(m, 'storage').andReturn deferred.promise
        deferred.resolve id: 1, text: 'yeah'

        m.fetch().then success
        expect(m.isDirty()).toBe false

    it 'is clean after update', ->
        success = jasmine.createSpy()
        m = new Model {id: 1}, url: '/items'
        m.set text: 'yeah mate'
        expect(m.isDirty()).toBe true

        deferred = Q.defer()
        spyOn(m, 'storage').andReturn deferred.promise

        m.save().then success
        deferred.resolve id: 1

        waitsFor ->
            success.wasCalled == true

        runs ->
            expect(m.isDirty()).toBe false

    it 'is clean after save', ->
        success = jasmine.createSpy()
        m = new Model {}, url: '/items'
        m.set text: 'yeah mate'
        expect(m.isDirty()).toBe true

        deferred = Q.defer()
        spyOn(m, 'storage').andReturn deferred.promise

        m.save().then success
        deferred.resolve id: 1

        waitsFor ->
            success.wasCalled == true

        runs ->
            expect(m.isDirty()).toBe false

    it 'only sets original value in dirty field after first set', ->
        m = new Model text: 'original text'
        m.set text: 'altered text'
        m.set text: 'different again text'

        expect(m._dirtyFields.text).toBe 'original text'

    it 'only dirty if field is set to different value', ->
        m = new Model text: 'original text'
        m.set text: 'original text'

        expect(m._dirtyFields.text).toBe undefined

    it 'it can reset unsaved field changes', ->
        m = new Model id: 4, name: 'gehan', gear: true
        m.set name: 'fecker', gear: false
        m.clearChanges()
        expect(m.get 'name').toBe 'gehan'
        expect(m.get 'gear').toBe true

    it 'resets objects too', ->
        m = new Model id: 4, myField: {
            someProperty: 'internet'
            someThing: 'webs'
        }
        m.set 'myField', {
            someProperty: 'webs'
            someThings: 'feck'
        }
        m.clearChanges()
        expect(m.get 'myField').toBeObject {
            someProperty: 'internet'
            someThing: 'webs'
        }

    it 'provides dereferenced object on get, so updates dont affect model', ->
        m = new Model id: 4, myField: {
            someProperty: 'internet'
            someThing: 'webs'
        }
        val = m.get 'myField'
        val.someThing = 'balls'
        expect(m.get('myField').someThing).toBe 'webs'

    it 'can create collection with Model.getCollection', ->
        expect(instanceOf Model.getCollection(), Collection).toBe true

    it 'when extending Model keeps Model.getCollection', ->
        ModelDef = new Class
            Extends: Model
            url: 'internet'

        col = ModelDef.getCollection()

        expect(instanceOf ModelDef.getCollection(), Collection).toBe true
        expect(col.url).toBe 'internet'

    it 'allows overriding of Collection def in children', ->
        Collection2 = new Class
            Extends: Collection

        ModelDef = new Class
            Extends: Model
            Collection:
                class: Collection2

        col1 = Model.getCollection()
        col2 = ModelDef.getCollection()

        expect(instanceOf col1, Collection2).toBe false
        expect(instanceOf col2, Collection2).toBe true

    it 'implements extra methods specified in Collection, copies objects', ->
        ModelDef = new Class
            Extends: Model
            Collection:
                class: Collection
                sortByField: 'yourMum'
                someObj:
                    value1: 'internet'

        col1 = ModelDef.getCollection()
        col2 = ModelDef.getCollection()

        expect(col1.sortByField).toBe 'yourMum'

        expect(col1.someObj.value1).toBe col2.someObj.value1

        col1.someObj.value1 = 'feck'

        expect(col1.someObj.value1).toNotBe col2.someObj.value1

    it 'overrides parent Collection methods but keeps others', ->
        Collection2 = new Class
            Extends: Collection

        ModelDef = new Class
            Extends: Model
            Collection:
                class: Collection2
                internet: 'yes'
                sortByField: 'yourMum'

        ModelDef2 = new Class
            Extends: ModelDef
            Collection:
                sortByField: 'yourDad'

        col = ModelDef2.getCollection()

        expect(instanceOf col, Collection2).toBe true
        expect(col.sortByField).toBe 'yourDad'
        expect(col.internet).toBe 'yes'

