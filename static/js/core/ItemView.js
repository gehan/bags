var ItemView;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
ItemView = new Class({
  Extends: View,
  tagName: 'div',
  className: 'content-item',
  template: 'item',
  events: {
    "click:.actions .archive": "archive"
  },
  initialize: function() {
    this.parent.apply(this, arguments);
    this.model.addEvent('change', __bind(function(key, value) {
      return this.renderChange(key, value);
    }, this));
    this.model.addEvent('remove', __bind(function() {
      return this.destroy();
    }, this));
    this.initSubViews();
    return this;
  },
  initSubViews: function() {
    var c;
    c = this.model.collections;
    return new ExtrasView(c.notes, c.replies, {
      el: this.refs.extras
    });
  },
  render: function(ref) {
    var data;
    if (ref == null) {
      ref = null;
    }
    data = this.model.toJSON();
    if (ref) {
      return this.rerender(ref, data);
    } else {
      return this.parent(data);
    }
  },
  renderChange: function(key, value) {
    return this.render(key);
  },
  renderCollections: function() {},
  archive: function(e, el) {
    console.log('archive');
    return this.model.remove();
  }
});