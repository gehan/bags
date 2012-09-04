beforeEach(function() {
    // Replace MooTools XHR with fake request
    if (typeof Browser.Request !== 'undefined') {
        Browser.Request = FakeXMLHttpRequest;
    }

    this.addMatchers({
        toBeObject: function(expected) {
            return JSON.encode(this.actual) === JSON.encode(expected);
        }
    });

    clearAjaxRequests();

});
