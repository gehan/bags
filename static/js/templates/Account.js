// Generated by CoffeeScript 1.3.1

define(function() {
  return dust.compileAndLoad({
    account: "<nav class=\"left\" data-behavior=\"Test\">\n    <a href=\"/account/user/\" data-trigger=\"push\">User</a>\n    <a href=\"/account/channel/\" data-trigger=\"push\">Channel face</a>\n</nav>\n<div class=\"page-body\" ref=\"body\">\n    <p>\n        Hello there i'm an account\n    </p>\n    <p ref=\"accountBody\">\n    </p>\n</div>",
    user: "<p>\n    I like user innit\n</p>",
    channel: "<p>\n    I like channel innit\n</p>"
  });
});
