(function() {

  define(function() {
    return dust.compileAndLoad({
      account: "<nav class=\"left\" data-behavior=\"Test\">\n    <a href=\"/account/user/\" data-trigger=\"push\">User</a>\n    <a href=\"/account/channel/\" data-trigger=\"push\">Channel face</a>\n</nav>\n<div class=\"page-body\" ref=\"body\">\n    <p>\n        Hello there i'm an account\n    </p>\n    <p ref=\"accountBody\">\n    </p>\n</div>",
      user: "<p>\n    <strong>I like user innit</strong>\n</p>\n<p>\n    <strong>I also like the internets</strong>\n</p>",
      channel: "<p>\n    I like channel innit\n</p>"
    });
  });

}).call(this);
