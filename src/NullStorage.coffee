`define(['bags/Storage'], function(Storage){`

NullStorage = new Class
    Extends: Storage

    storage: (operation, data, options={}) ->
        deferred = Q.defer()
        deferred.resolve success: true
        return deferred.promise

return NullStorage
`})`
