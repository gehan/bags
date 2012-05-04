View = new Class
    Extends: Templates

    Implements: [Options, Events]

    model: null
    collection: null
    el: null
    template: null

    initialize: (options={}) ->
        @loadAllTemplates()
        for key in ['collection', 'model', 'el', 'template']
            if options[key]?
                @[key] = options[key]
                delete options[key]
        @setOptions options
        @render() if @template
        @

    render: ->
        @parent @parseForDisplay()

    parseForDisplay: ->
        @model.toJSON()

    getElement: -> @el.getElement.apply @el, arguments
    getElements: -> @el.getElements.apply @el, arguments
