
define(function() {
  return dust.compileAndLoad({
    base: "<body>\n    <header class=\"main\">\n        <a href=\"/\" data-trigger=\"push\">Home</a>\n        <a href=\"/page/1/\" data-trigger=\"push\">Page 1</a>\n        <a href=\"/page/2/\" data-trigger=\"push\">Page 2</a>\n        <a href=\"/account/\" data-trigger=\"push\">Account 1</a>\n    </header>\n    <div ref=\"body\" class=\"body\">\n        <p data-behavior=\"Test\">Hello there look at the internets!</p>\n    </div>\n</body>"
  });
});
