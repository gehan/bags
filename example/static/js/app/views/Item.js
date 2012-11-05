(function() {

  define(['bags/View'], function(View) {
    return new Class({
      Extends: View,
      template: 'item',
      events: {
        "click:em": "textClicked"
      },
      textClicked: function() {
        return console.log('hello there ', this.model.toJSON());
      }
    });
  });

}).call(this);
