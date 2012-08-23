(function() {

  define(['templates/app', 'bags/View'], function(tpl, View) {
    return new Class({
      Extends: View,
      template: 'base'
    });
  });

}).call(this);
