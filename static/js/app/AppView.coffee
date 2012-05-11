AppView = new Class
    Extends: View

    template: 'base'

PageView = new Class
    Extends: View
    Binds: ['renderCollection', 'addOne', 'removeOne']

    template: 'page'

    data:
        pageId: null

    initialize: ->
        @parent.apply @, arguments

        # Items collection
        @collection = new ItemCollection Globals._preload or [],
            onAdd: @addOne
            onRemove: @removeOne
            onReset: @renderCollection

        if Globals._preload
            @renderCollection()
        @

    setPage: (pageId) ->
        if @data.pageId isnt pageId
            @data.pageId = pageId
            @rerender 'leftNav'

    getSection: (section) ->
        # cancel existing fetch
        @data.section = section
        if Globals._preload?
            delete Globals._preload
        else
            @_removeCollectionItems()
            @collection.fetch @data

    addOne: (model) ->
        $(new ItemView model: model).inject @refs.items

    removeOne: (model) ->

    renderCollection: (collection=@collection) ->
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


