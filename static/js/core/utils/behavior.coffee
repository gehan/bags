do ->
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
        Dropdown: (element, api) ->
            options = JSON.decode(api.get 'options')

            dropdown = new InlineDropdown element, options
            api.addEvents
                cleanup: -> dropdown.destroy()

            return dropdown

        ###
        Provides the user profile dropdown, for logging out etc
        ###
        ProfileDropdown: (element, api) ->
            profile = new ProfileDropdown element, Globals.user
            return profile

    behavior = new Behavior
        breakOnErrors: true

    window.addEvents
        resize: ->
            behavior.fireEvent 'resize'

    document.addEvent 'domupdated', (nodes=document.body) ->
        behavior.apply nodes