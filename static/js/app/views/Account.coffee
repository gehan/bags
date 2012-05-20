define ['templates/Account', 'core/View'], (tpl, View) ->

    Root: new Class
        Extends: View

        events:
            "click:p": "log"

        template: 'account'

        log: -> console.log 'tits'

    User: new Class
        Extends: View

        template: 'user'

    Channel: new Class
        Extends: View

        template: 'channel'
