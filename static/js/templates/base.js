// Generated by CoffeeScript 1.3.1

(function() {
  var compiled, content, name, templates, _results;
  templates = {
    base: "<body>\n    <header>\n        <a href=\"/page/1/\" data-trigger=\"push\">Page 1</a>\n        <a href=\"/page/2/\" data-trigger=\"push\">Page 2</a>\n        <a href=\"/account/channels/1/\" data-trigger=\"push\">Account</a>\n    </header>\n    <div ref=\"body\">\n    </div>\n</body>",
    page: "<nav ref=\"leftNav\">\n    {>pageLeftNav/}\n</nav>\n<p>\n    Hello there i'm page {pageId} section {unread}\n</p>\n<ul ref=\"items\">\n</ul>",
    pageLeftNav: "<a href=\"/page/{pageId}/unread/\" data-trigger=\"push\">Subsection 1</a>\n<a href=\"/page/{pageId}/priority/\" data-trigger=\"push\">SubSection 2</a>\n<a href=\"/page/{pageId}/assigned/\" data-trigger=\"push\">SubSection 3</a>",
    account: "<p>\n    Hello there i'm an account\n</p>",
    item: "<li>{id} - <em>{text}</em> - {description}</li>",
    body: ""
  };
  _results = [];
  for (name in templates) {
    content = templates[name];
    compiled = dust.compile(content, name);
    _results.push(dust.loadSource(compiled));
  }
  return _results;
})();