`define(['ko', 'bags/Template'],
function(ko, Template){`

pushHandler = (event) ->
    element = event.target
    event.preventDefault()
    href = element.get 'href'
    History.pushState null, null, href

ko.bindingHandlers.pushState =
    init: (element, valueAccessor) ->
        element.addEvent 'click', pushHandler
        ko.utils.domNodeDisposal.addDisposeCallback element, ->
            element.removeEvent 'click', pushHandler

ko.bindingHandlers.editable =
    init: (element, valueAccessor, allBindingsAccessor) ->
        # get the options that were passed in
        options = allBindingsAccessor().jeditableOptions or {}

        # "submit" should be the default onblur action like regular ko controls
        if !options.onblur
            options.onblur = 'submit';

        # set the value on submit and pass the editable the options
        editFn = ->
            element.contentEditable = true
            element.focus()
        blurFn = ->
            valueAccessor() element.get('text')
            element.contentEditable = false

        element.addEvents
            click: editFn
            blur: blurFn

        ko.utils.domNodeDisposal.addDisposeCallback element, ->
            element.removeEvents
                click: editFn
                blur: blurFn

     #update the control when the view model changes
     update: (element, valueAccessor) ->
         value = ko.utils.unwrapObservable valueAccessor()
         $(element).set 'html', value

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
