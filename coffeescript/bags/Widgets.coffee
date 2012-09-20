define ['bags/View'], (View) ->

    CollectionView: new Class
        Extends: View
        Binds: ['_sortCollection']

        initialize: (@collection, @listEl, @modelView) ->
            ret = @parent.apply this, arguments

            @collection.addEvents
                sort: @_sortCollection
                saveSuccess: @_sortCollection

            ret

        _createModelViews: ->
            for model in @collection
                view = new @modelView model: model
                @listEl.adopt $(view)

        _sortCollection: ->
            @reorderViews @collection, @listEl

        destroy: ->
            @collection.addEvents
                sort: @_sortCollection
                saveSuccess: @_sortCollection
            @parent.apply this, arguments

