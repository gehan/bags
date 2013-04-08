`define(['Q', './Storage'], function(Q, Storage){`

NullStorage = new Class
    Extends: Storage

    storage: (operation, data, options={}) ->
        deferred = Q.defer()
        if data and not data.id
            data.id = Math.floor(Math.random()*100)
        deferred.resolve data
        return deferred.promise

return NullStorage
`})`
