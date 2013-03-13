`define(['ko', 'bags/Template'],
function(ko, Template){`

ko.bindingHandlers.someBehavior =
    init: (element, valueAccessor) ->
        console.log 'apply some behavior'
        ko.utils.domNodeDisposal.addDisposeCallback element, ->
            console.log 'removed'

ko.bindingHandlers.itemBehavior =
    init: (element, valueAccessor) ->
        ko.utils.domNodeDisposal.addDisposeCallback element, ->
            console.log 'removed item'
    update: (element, valueAccessor, allBindingsAccessor, viewModel) ->
        console.log 'updated item behavior'

# Helper to allow multiple ViewModels in same html template
ko.bindingHandlers.stopBinding =
    init: ->
        return controlsDescendantBindings: true
ko.virtualElements.allowedBindings.stopBinding = true

ViewModel = new Class
    Implements: [Options, Events, Template]

    options:
        # If specified then will render dust template
        template: null

    init: ->

    # Define the properties of the ViewModel here. Functions can be put
    # directly on the class but properties can't be on the prototype so must
    # go here. It will also group them in one place.
    properties: ->

    initialize: (@element, options) ->
        @setOptions options
        @init()
        @properties()
        if @options.template
            el = @renderTemplate @options.template
            @element.adopt el
        @applyBindings()
        return this

    computed: (fn, bind) ->
        ko.computed fn, bind

    observable: (value) ->
        ko.observable value

    observableArray: (value=[]) ->
        ko.observableArray value

    applyBindings: ->
        ko.applyBindings this, @element

    destroy: ->
        ko.cleanNode @element

return ViewModel

`})`
