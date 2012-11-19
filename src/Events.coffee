# Extends MooTools events to allow listening to any eventws

`define(function() {`

removeOn = (string) ->
    string.replace(/^on([A-Z])/, (full, first) ->
        first.toLowerCase()
    )

BagsEvents = new Class
    Extends: Events

    fireEvent: (type, args, delay, dontFireAny=false) ->
        eventName = removeOn type
        if @$events['any'] and not dontFireAny and eventName isnt 'any'
            @fireEvent 'any', [eventName, args], delay, true
        @parent type, args, delay

return BagsEvents

`});`
