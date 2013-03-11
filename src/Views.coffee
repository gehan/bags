define ['bags/View'], (View) ->

    CollectionView: new Class
        Extends: View
        Binds: ['_sortViews', '_collectionAdd']

        options:
            # Define a view for when collection is empty
            itemEmptyView: null
            itemViewOptions: {}

        initialize: (@collection, @listEl, @modelView, options={}) ->
            @setOptions options
            @collection.addEvents
                add: @_collectionAdd
                sort: @_sortViews
                remove: (model) =>
                    @_removeModelsView model
                    @_toggleEmptyViewIfEmpty()

            @_createModelViews()
            @_toggleEmptyViewIfEmpty()
            @sort()
            @

        getModelsView: (model) ->
            views = @getViews @listEl
            for view in views
                if view.model is model
                    return view

        _removeModelsView: (model) ->
            view = @getModelsView model
            view.destroy() if view?

        _toggleEmptyViewIfEmpty: ->
            return unless @options.itemEmptyView
            if @collection.length == 0
                @_showEmptyItem()
            else
                @_hideEmptyItem()

        sort: ->
            @collection.sortBy @collection.sortField if @collection.sortField?

        _createModelViews: ->
            @_createModelView(model) for model in @collection

        _createModelView: (model) ->
            options = Object.clone @options.itemViewOptions
            Object.append options,
                autoDestroyModel: true
                model: model
                injectTo: @listEl
                onAny: (event, args=[]) =>
                    if event in ['render', 'rerender']
                        @sort()
                    @fireEvent event, [view].combine(args)

            view = new @modelView options

        _collectionAdd: (model) ->
            @_toggleEmptyViewIfEmpty()
            @_createModelView model
            @_sortViews()

        _showEmptyItem: ->
            return if @_emptyItem
            @_emptyItem = new @options.itemEmptyView @options.itemViewOptions
            @_emptyItem.inject @listEl

        _hideEmptyItem: ->
            return unless @_emptyItem
            @_emptyItem.destroy()
            delete @_emptyItem

        _sortViews: ->
            return unless @collection.length > 0
            @reorderViews @collection, @listEl

        destroy: ->
            @collection.removeEvents
                add: @_collectionAdd
                sort: @_sortViews
            @destroyViews @listEl

