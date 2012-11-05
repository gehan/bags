curl ['core/dropdowns/InlineDropdown'], (InlineDropdown) ->

    Behavior.addGlobalFilters
        ###
        Provide a dropdown, the element with data-behavior attribute is the handle
        which opens the dropdown. Set data-dropdown on the actual dropdown element

        options:
            # The dropdown will close if you click anywhere on it, which is fine
            # for dropdown menus. If you only want specific elements to close the
            # dropdown then set this to true
            allowClicks: false

        element-attributes:
            data-dropdown
                - set this on the dropdown
            data-dropdown-closeonclick
                - set this on elements that you want to close the dropdown, use with
                  the allowClicks option

        <li data-behavior="Dropdown" data-dropdown-options="{}">
            I'm the handle
            <ul data-dropdown>
                I'm the dropdown
            </ul>
        </li>
        ###
        Dropdown:
            defaults:
                allowClicks: false

            setup: (element, api) ->
                dropdown = new InlineDropdown element,
                    allowClicks: api.getAs Boolean, 'allowClicks'

                api.addEvents
                    cleanup: -> dropdown.destroy()

                return dropdown

        Test:
            setup: (element, api) ->
                console.log 'Behavior applied to ', element

    Delegator.register 'click', 'push', (event, element, api) ->
        event.preventDefault()
        href = element.get 'href'
        History.pushState null, null, href

    Delegator.register 'click', 'internet', (event, element, api) ->
        console.log 'oh yeah ', element

    behavior = new Behavior
        breakOnErrors: true

    window.addEvents
        resize: ->
            behavior.fireEvent 'resize'

    document.addEvent 'domupdated', (container=document.body) ->
        console.log 'apply behavior to ', container
        behavior.apply container

    document.addEvent 'domready', ->
        new Delegator().attach document.body

