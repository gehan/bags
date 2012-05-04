var ReplyView;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
ReplyView = new Class({
  Extends: View,
  template: 'reply',
  initialize: function() {
    this.parent.apply(this, arguments);
    this.model.addEvent('change', __bind(function() {
      return this.render();
    }, this));
    this.model.addEvent('remove', __bind(function() {
      return this.destroy();
    }, this));
    return this;
  },
  render: function() {
    var _html;
    _html = Mustache.template(this.template).render(this.model.toJSON());
    return this.el.set('html', _html);
  }
});