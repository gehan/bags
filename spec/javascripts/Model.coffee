do ->
    flatten = (obj) ->
        JSON.encode obj

    describe "Model test", ->
        m = null

        beforeEach ->
            m = new Model()

        it 'gets/sets attributes', ->
            expect(m.has 'test').toBe false
            expect(m.get 'test').toBe undefined

            m.set 'test', 'internet'
            expect(m.has 'test').toBe true
            expect(m.get 'test').toBe 'internet'

        it 'sets multiple attributes', ->
            m.setMany
                test: 'internet2'
                more: 'fecker'

            expect(m.get 'test').toBe 'internet2'
            expect(m.get 'more').toBe 'fecker'

        it 'fires change event on attr change', ->
            changed = {}
            m.addEvent 'change', (key, value) ->
                changed[key] = value

            changedAKey = null
            m.addEvent 'change:aKey', (value) ->
                changedAKey = value

            m.setMany
                aKey: 'internet'
                bKey: 'test'

            expect(changed.aKey).toBe 'internet'
            expect(changedAKey).toBe 'internet'
            expect(changed.bKey).toBe 'test'

        it 'sets defaults silently when initializing model', ->
            Model.implement
                _defaults:
                    type: 'text'
                    internet: 2
                    override: 'feck'

            changeFired = false
            m = new Model {override: 'arse'},
                onChange: ->
                    console.log arguments
                    changeFired = true

            expect(m.get 'type').toBe 'text'
            expect(m.get 'internet').toBe 2
            expect(m.get 'override').toBe 'arse'

            expect(changeFired).toBe false

            Model.implement _defaults: null
            Model.implement _defaults: {}

        it 'inits types correctly', ->
            Model.implement
                _types:
                    aDate: 'Date'
                    aModel: 'Model'

            m = new Model
                aDate: '2012/01/01 02:02'
                aModel: {feck: 'arse'}

            expect(instanceOf m.get('aDate'), Date).toBe true
            expect(m.get('aDate').format '%Y/%m/%d %H:%M').toBe '2012/01/01 02:02'

            expect(instanceOf m.get('aModel'), Model).toBe true
            expect(m.get('aModel').get 'feck').toBe 'arse'

            Model.implement _types: null
            Model.implement _types: {}

        it 'inits type within arrays correctly', ->
            Model.implement
                _types:
                    aDate: 'Date'

            m = new Model
                aDate: ['2012/01/01 02:02', '2012/01/01 02:03']

            expect(m.get('aDate')[0].format '%Y/%m/%d %H:%M').toBe '2012/01/01 02:02'
            expect(m.get('aDate')[1].format '%Y/%m/%d %H:%M').toBe '2012/01/01 02:03'

            Model.implement _types: null
            Model.implement _types: {}

        it 'sets id attribute when passed in', ->
            m = new Model id: 12

            expect(m.get 'id').toBe(12)
            expect(m.id).toBe(12)

        it 'sets custtom id attribute when passed in', ->
            Model.implement
                _idField: "_id"

            m = new Model _id: 12

            expect(m.get '_id').toBe(12)
            expect(m.id).toBe(12)

            Model.implement
                _idField: "id"

