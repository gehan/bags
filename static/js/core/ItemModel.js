var ItemModel;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
ItemModel = new Class({
  Extends: Model,
  _types: {
    id: 'Number',
    text: 'String',
    type: 'String',
    likes: 'Number',
    updated: 'Date',
    internets: 'Internet',
    replies: 'ReplyCollection',
    notes: 'ReplyCollection',
    tags: 'ReplyCollection'
  },
  _defaults: {
    updated: function() {
      return new Date();
    }
  },
  jsonText_sections: function(value) {
    var str;
    str = "";
    value.each(__bind(function(textSection) {
      return str += textSection[0];
    }, this));
    return str;
  }
});