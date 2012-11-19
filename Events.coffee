# Extends MooTools events to allow listening to any eventws

`define(['bags/Exceptions'], function(Exceptions) {`

BagsEvents = new Class
    Extends: Events

    addEvent: (type, fn, internal) ->
        @parent type, fn, internal

return BagsEvents
`});`
