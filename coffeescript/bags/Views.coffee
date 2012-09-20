define ['bags/View'], (View) ->

    CollectionView: new Class
        Extends: View
        Binds: ['_sortViews', '_sortCollection', '_collectionAdd']

        initialize: (@collection, @listEl, @modelView, options) ->
            @collection.addEvents
                add: @_collectionAdd
                sort: @_sortViews

            @_sortCollection silent: true
            @_createModelViews()
            @

        _createModelViews: ->
            @_createModelView(model) for model in @collection

        _createModelView: (model) ->
            view = new @modelView
                model: model
                onRender: @_sortCollection
            @listEl.adopt $(view)

        _collectionAdd: (model) ->
            @_createModelView model
            @_sortCollection()

        _sortCollection: (options={}) ->
            if @collection.sortField
                @collection.sortBy @collection.sortField, options

        _sortViews: ->
            @reorderViews @collection, @listEl

        destroy: ->
            @collection.removeEvents
                add: @_collectionAdd
                sort: @_sortViews
            @destroyViews @listEl

