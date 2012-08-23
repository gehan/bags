(function() {

  define(['bags/Router', 'app/views/Page'], function(Router, PageView) {
    return new Class({
      Extends: Router,
      routes: {
        ':page/': 'page',
        ':page/:section/': 'page'
      },
      viewClass: PageView,
      page: function(args, data) {
        var pageId, section;
        pageId = args.page;
        section = args.section || 'priority';
        console.log('page', pageId, section);
        this.view.setPage(pageId);
        return this.view.getSection(section);
      }
    });
  });

}).call(this);
