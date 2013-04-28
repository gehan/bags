`define(['Q', './Api'], function(Q, Storage){`

NullApi = new Class
    Extends: Api

    api: (operation, data, options={}) ->
        deferred = Q.defer()
        if data and not data.id
            data.id = Math.floor(Math.random()*100)
        deferred.resolve data
        return deferred.promise

return NullApi
`})`
