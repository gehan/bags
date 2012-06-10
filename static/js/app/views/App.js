(function() {

  define(['templates/app', 'core/View'], function(tpl, View) {
    return new Class({
      Extends: View,
      template: 'base'
    });
  });

}).call(this);
