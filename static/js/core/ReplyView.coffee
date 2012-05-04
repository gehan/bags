ReplyView = new Class
    Extends: View

    template: 'reply'

    initialize: ->
        @parent.apply @, arguments
        @model.addEvent 'change', => @render()
        @model.addEvent 'remove', => @destroy()
        @

    render: ->
        _html = Mustache.template(@template).render @model.toJSON()
        @el.set 'html', _html

