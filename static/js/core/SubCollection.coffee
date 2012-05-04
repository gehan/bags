SubCollection = new Class
    Extends: Collection

    model: Model

    initialize: (@parentModel, models=[], options) ->
        @parent models, options
        @
