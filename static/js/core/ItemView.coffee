ItemView = new Class
    Extends: View

    tagName: 'div'
    className: 'content-item'
    template: 'item'

    events:
        "click:.actions .archive": "archive"

    initialize: ->
        @parent.apply @, arguments
        @model.addEvent 'change', (key, value) => @renderChange(key, value)
        @model.addEvent 'remove', => @destroy()
        @initSubViews()
        @

    initSubViews: ->
        c = @model.collections
        new ExtrasView c.notes, c.replies, el: @refs.extras

    render: (ref=null) ->
        data = @model.toJSON()
        if ref
            @rerender ref, data
        else
            @parent data

    renderChange: (key, value) ->
        @render key

    renderCollections: ->

    archive: (e, el) ->
        console.log 'archive'
        this.model.remove()


