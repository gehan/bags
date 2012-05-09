AppView = new Class
    Extends: View

    template: 'base'

PageView = new Class
    Extends: View

    template: 'page'

    data:
        pageId: null

    initialize: ->
        @parent.apply @, arguments

        # Items collection
        @collection = new ItemCollection [],
            onAdd: (model) => @addOne model
            onRemove: (model) => @removeOne model
            onReset: (collection) => @add collection

        @

    setPage: (pageId) ->
        if @data.pageId isnt pageId
            @data.pageId = pageId
            @rerender 'leftNav'

    getSection: (section) ->
        @data.section = section
        @_removeCollectionItems()
        @collection.fetch @data

    addOne: (model) ->
        $(new ItemView model: model).inject @refs.items

    removeOne: (model) ->

    add: (collection) ->
        # Not right here, remove existing elements properly
        @addOne model for model in collection

    _removeCollectionItems: ->
        models = @collection.clone()
        models.invoke 'remove'

    destroy: ->
        @_removeCollectionItems()
        @parent()

AccountView = new Class
    Extends: View

    template: 'account'

ItemView = new Class
    Extends: View

    template: 'item'

    events:
        "click:em": "textClicked"

    textClicked: ->
        console.log 'hello there ', @model.toJSON()

UserView = new Class
    Extends: View

    template: 'user'

ChannelView = new Class
    Extends: View

    template: 'channel'


