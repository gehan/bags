
define(['templates/Account', 'core/View'], function(tpl, View) {
  return {
    Root: new Class({
      Extends: View,
      template: 'account'
    }),
    User: new Class({
      Extends: View,
      events: {
        "click:strong": "log"
      },
      template: 'user',
      log: function() {
        return console.log("oh yeah internet");
      }
    }),
    Channel: new Class({
      Extends: View,
      template: 'channel'
    })
  };
});
