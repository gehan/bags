define ['bags/View'], (View) ->

    CollectionView: new Class
        Extends: View
        Binds: ['_sortViews', '_collectionAdd']

        initialize: (@collection, @listEl, @modelView, options) ->
            @setOptions options
            @collection.addEvents
                add: @_collectionAdd
                sort: @_sortViews

            @_createModelViews()
            @

        _createModelViews: ->
            @_createModelView(model) for model in @collection

        _createModelView: (model) ->
            view = new @modelView
                model: model
                injectTo: @listEl
                onRender: =>
                    @_sortCollection()
                    @fireEvent 'render', [view].combine(arguments)
                onDelete: =>
                    @fireEvent 'delete', [view].combine(arguments)

        _collectionAdd: (model) ->
            @_createModelView model
            @_sortViews()

        _sortCollection: ->
            @collection.sortBy @collection.sortField if @collection.sortField?

        _sortViews: ->
            @reorderViews @collection, @listEl

        destroy: ->
            @collection.removeEvents
                add: @_collectionAdd
                sort: @_sortViews
            @destroyViews @listEl

