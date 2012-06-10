(function() {

  define(['core/Collection', 'core/Model'], function(Collection, Model) {
    return new Class({
      Extends: Collection,
      model: Model,
      url: '/page/{pageId}/{section}/',
      fetch: function(options) {
        return this.parent({
          url: this.url.substitute(options)
        });
      }
    });
  });

}).call(this);
