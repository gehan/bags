define ['templates/Account', 'bags/View'], (tpl, View) -> {

Root: new Class
    Extends: View

    template: 'account'

User: new Class
    Extends: View

    events:
        "click:strong": "log"

    template: 'user'

    log: ->
        console.log "oh yeah internet"

Channel: new Class
    Extends: View

    template: 'channel'

}
