ExtrasView = new Class
    Extends: View

    initialize: (@notes, @replies, options)->
        @parent options
        @

    render: ->
        @el
