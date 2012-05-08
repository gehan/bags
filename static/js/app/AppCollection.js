var ItemCollection;

ItemCollection = new Class({
  Extends: Collection,
  model: Model,
  initialize: function() {
    this.parent.apply(this, arguments);
    console.log('collection');
    return this;
  }
});
