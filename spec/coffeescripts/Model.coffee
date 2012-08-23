Model = null
Collection = null

done = false
curl ['bags/Model', 'bags/Collection'], (_Model, _Collection) ->
    Model = _Model
    Collection = _Collection
    done = true

flatten = (obj) ->
    JSON.encode obj

describe "Model test", ->
    m = null

    beforeEach ->
        waitsFor -> done
        m = new Model()

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
        expect(m.get 'key').toBe obj

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
            types:
                aDate: 'Date'
                aModel: -> Model

        m = new Model
            aDate: '2012/01/01 02:02'
            aModel: {feck: 'arse'}

        expect(instanceOf m.get('aDate'), Date).toBe true
        expect(m.get('aDate').format '%Y/%m/%d %H:%M').toBe '2012/01/01 02:02'

        expect(instanceOf m.get('aModel'), Model).toBe true
        expect(m.get('aModel').get 'feck').toBe 'arse'

        Model.implement types: null
        Model.implement types: {}

    it 'inits type within arrays correctly', ->
        Model.implement
            types:
                aDate: 'Date'

        m = new Model
            aDate: ['2012/01/01 02:02', '2012/01/01 02:03']

        expect(m.get('aDate')[0].format '%Y/%m/%d %H:%M').toBe '2012/01/01 02:02'
        expect(m.get('aDate')[1].format '%Y/%m/%d %H:%M').toBe '2012/01/01 02:03'

        Model.implement types: null
        Model.implement types: {}

    it 'sets id attribute when passed in', ->
        m = new Model id: 12

        expect(m.get 'id').toBe(12)
        expect(m.id).toBe(12)

    it 'sets custom id attribute when passed in', ->
        Model.implement
            _idField: "_id"

        m = new Model _id: 12

        expect(m.get '_id').toBe(12)
        expect(m.id).toBe(12)

        Model.implement
            _idField: "id"

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
            types:
                subModel: Model

        vals =
            key1: 'value1'
            subModel: {key2: 'value2'}

        mdl = new Mdl vals
        subModel = mdl.get 'subModel'

        expect(subModel.get '_parent').toBe mdl

    it 'instantiates a collection if set as type, adds to collections', ->
        Cll = new Class
            Extends: Collection
            model: Model

        Mdl = new Class
            Extends: Model
            types:
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

        expect(addedKey).toBe 'subCollection'
        expect(addedCollection).toBe mdl.get('subCollection')

    it 'sends post query to url on save', ->
        attrs =
            value1: 'key1'
            value2: 'key2'

        saved = false
        m.addEvent 'saveSuccess', ->
            saved = true

        m.set attrs

        expect(m.isNew()).toBe true

        setNextResponse
            status: 200
            responseText: flatten
                success: true
                data:
                    id: 2

        m.save()

        req = mostRecentAjaxRequest()
        expect(req.method).toBe 'POST'
        expect(saved).toBe true
        expect(req.params).toBe Object.toQueryString(attrs)
        expect(m.id).toBe 2

    it 'sends update query to url on save', ->
        attrs =
            id: 2
            value1: 'key1'
            value2: 'key2'

        m.set attrs

        expect(m.isNew()).toBe false

        m.save()

        req = mostRecentAjaxRequest()
        expect(req.method).toBe 'POST'
        expect(req.params).toBe "_method=update&" + Object.toQueryString(attrs)

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
            if not saveCompleted
                changeCalledBeforeSave = true

        m.save 'action', 'deleted'

        req = mostRecentAjaxRequest()
        expect(req.params).toBe Object.toQueryString(action: 'deleted')
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

    it 'save accepts value obj', ->
        m.set 'action', 'face'
        m.save action: 'deleted', feck: 'arse'

        req = mostRecentAjaxRequest()
        expect(req.params).toBe Object.toQueryString(action: 'deleted', feck: 'arse')

    it 'save works with types', ->
        Mdl = new Class
            Implements: Model
            types:
                aDate: Date

        m = new Mdl
        changeCalled = false
        m.addEvent 'change', ->
            changeCalled = true
        dte = new Date('2012-01-01')

        m.save {aDate: dte}

        req = mostRecentAjaxRequest()
        expect(req.params).toBe Object.toQueryString(aDate: dte.toJSON())
        expect(changeCalled).toBe false

    it 'save accepts callback for success', ->
        success = jasmine.createSpy 'success callback'
        setNextResponse status: 200, responseText: flatten(success: true)
        m.save null, null, success: success
        expect(success).toHaveBeenCalled()
        calledWith = flatten(success.mostRecentCall.args)
        expect(calledWith).toBe flatten([success: true])

    it 'save accepts callback for failure', ->
        fail = jasmine.createSpy 'fail callback'
        setNextResponse status: 500
        m.save null, null, failure: fail
        expect(fail).toHaveBeenCalled()
