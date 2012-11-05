define ['bags/View'], (View) -> \

new Class
    Extends: View

    template: 'item'

    events:
        "click:em": "textClicked"

    textClicked: ->
        console.log 'hello there ', @model.toJSON()


