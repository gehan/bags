ItemModel = new Class
    Extends: Model

    _types:
        id: 'Number'
        text: 'String'
        type: 'String'
        likes: 'Number'
        updated: 'Date'
        internets: 'Internet'
        replies: 'ReplyCollection'
        notes: 'ReplyCollection'
        tags: 'ReplyCollection'

    _defaults:
        updated: -> new Date()

    jsonText_sections: (value) ->
        str = ""
        value.each (textSection) =>
            str += textSection[0]
        return str
