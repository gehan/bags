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
        if not @pageModel?
            @pageModel = new PageModel {},
                onFetch: =>
                    @data.page = @pageModel.toJSON()
                    @rerender 'leftNav'

        if @data.pageId isnt pageId
            @data.pageId = pageId
            @pageModel.set 'id', pageId
            @pageModel.fetch()

    getSection: (section) ->
        # cancel existing fetch
        @data.section = section
        if Globals._preload?
            delete Globals._preload
        else
            @_removeCollectionItems()
            @collection.fetch @data

    addOne: (model, injectTo=@refs.items) ->
        (new ItemView model: model).inject injectTo

    removeOne: (model) ->

    renderCollection: (collection=@collection) ->
        @lastModels.invoke 'remove' if @lastModels?
        fragment = document.createDocumentFragment()
        @addOne model, fragment for model in collection
        console.log fragment
        @refs.items.appendChild fragment

    _removeCollectionItems: ->
        @lastModels = @collection.clone()
        #models.invoke 'remove'

    destroy: ->
        # Stop model/collection fetches?
        #
        @_removeCollectionItems()
        @parent()

AccountView = new Class
    Extends: View

    events:
        "click:p": "log"

    template: 'account'

    log: -> console.log 'tits'

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


