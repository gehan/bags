var ExtrasView;
ExtrasView = new Class({
  Extends: View,
  initialize: function(notes, replies, options) {
    this.notes = notes;
    this.replies = replies;
    this.parent(options);
    return this;
  },
  render: function() {
    return this.el;
  }
});