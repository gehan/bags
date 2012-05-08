ItemCollection = new Class
    Extends: Collection

    model: Model

    initialize: ->
        @parent.apply @, arguments

        console.log 'collection'

        @


