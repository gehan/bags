ItemsView = new Class
    Extends: View

    initialize: ->
        self = @
        @parent.apply @, arguments
        @collection.addEvent 'fetch', => @render()
        @collection.addEvent 'add', (model) => @addOne(model)
        @collection.addEvent 'remove', (model) => @removeOne(model)
        @collection.addEvent 'reset', (collection) => @add(collection)
        @addOne model for model in @collection
        @

    render: ->

    add: (collection) ->
        @addOne model for model in collection

    addOne: (model) ->
        @el.adopt $(new ItemView model: model)

    removeOne: (model) ->
        model.remove()
