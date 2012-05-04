var SubCollection;

SubCollection = new Class({
  Extends: Collection,
  model: Model,
  initialize: function(parentModel, models, options) {
    this.parentModel = parentModel;
    if (models == null) models = [];
    this.parent(models, options);
    return this;
  }
});
