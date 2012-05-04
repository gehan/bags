var ItemCollection;
ItemCollection = new Class({
  Extends: Collection,
  model: ItemModel,
  url: '/ajax/page/{sourceId}/{section}/{page}/',
  fetch: function(options) {
    if (options == null) {
      options = {
        sourceId: None,
        section: None,
        page: None
      };
    }
    return this.parent({
      url: this.url.substitute(options)
    });
  },
  parse: function(response) {
    return response.items;
  },
  comparator: function(a, b) {
    return Date.compare(a.get('updated'), b.get('updated'));
  }
});