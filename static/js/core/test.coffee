item = null; view = null; collection = null
window.addEvent 'domready', -> do ->
    defaults =
        id: 5
        text: "You are the internet arent you?"
        type: "post"
        likes: 15
        #updated: "2011-12-28 15:03"
        internets: [
            {id: 15, text: 'hello'}
            {id: 20, text: 'fecker'}
        ]

    item = new ItemModel defaults

    items = [{
        id: 5
        text: "You are the internet arent you?"
        type: "post"
        likes: 15
        updated: "2011-12-28 15:03"
        internets: [
            {id: 15, text: 'hello'}
            {id: 20, text: 'fecker'}
        ]
    }, {
        id: 12
        text: "You are the interface balls?"
        type: "post"
        likes: 24
        updated: "2011-12-28 15:10"
        internets: [
            {id: 15, text: 'hello'}
            {id: 20, text: 'fecker'}
        ]
    }]

    collection = new ItemCollection items
    view = new ItemsView collection:collection, el: $('items')
