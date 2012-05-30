
define(function() {
  return dust.compileAndLoad({
    page: "<nav ref=\"leftNav\" class=\"left\">\n    {>pageLeftNav/}\n</nav>\n<div class=\"page-body\">\n    <div ref=\"page-top\">\n        <p data-trigger=\"internet\">Hello there i'm {page.name}</p>\n        <select data-behavior=\"Test\">\n            <option>Newest First</option>\n            <option>Oldest First</option>\n        </select>\n    </div>\n    <ul ref=\"items\">\n    </ul>\n</div>",
    pageLeftNav: "<a href=\"/page/{pageId}/unread/\" data-trigger=\"push\">Unread</a>\n<a href=\"/page/{pageId}/priority/\" data-trigger=\"push\">Priority</a>\n<a href=\"/page/{pageId}/assigned/\" data-trigger=\"push\">Assigned</a>",
    item: "<li data-trigger=\"internet\" data-behavior=\"Test\">{id} - <em>{text}</em> - {description}</li>"
  });
});
