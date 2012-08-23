beforeEach(function() {
    // Replace MooTools XHR with fake request
    if (typeof Browser.Request !== 'undefined') {
        Browser.Request = FakeXMLHttpRequest;
    }

    clearAjaxRequests();

});
