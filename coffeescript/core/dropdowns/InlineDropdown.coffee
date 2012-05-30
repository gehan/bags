define -> \

new Class
    Implements: [Options, Events]
    Binds: ['_clickHandler', '_windowClickHandler']

    options:
        dropdownSelector: '[data-dropdown]'
        allowClicks: false

    initialize: (@handle, options) ->
        @setOptions options
        @el = @handle.getElement '[data-dropdown]'
        @attachEvents()
        @

    attachEvents: ->
        @handle.addEvent 'click', @_clickHandler

    isVisible: ->
        @el? and @el.isVisible()

    show: ->
        @el.show()
        @handle.addClass 'active'
        document.addEvent 'mouseup', @_windowClickHandler

    hide: ->
        @el.hide()
        @handle.removeClass 'active'
        document.removeEvent 'mouseup', @_windowClickHandler

    _clickHandler: (e) ->
        if @options.allowClicks and @el.contains(e.target) and not e.target.get('data-dropdown-closeonclick')?
            return
        if not @isVisible()
            @show()
        else
            @hide()

    _windowClickHandler: (e) ->
        # This event somehow fires even when the box isnt visible and causes problems without this line
        if not @isVisible()
            return
        if @el.contains(e.target) or @handle.contains(e.target) or @handle == e.target
            return
        @hide()
