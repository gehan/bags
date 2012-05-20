define ['core/Router', 'app/views/PageView'], (Router, PageView) ->

    new Class
        Extends: Router

        routes:
            ':page/': 'page'
            ':page/:section/': 'page'

        viewClass: PageView

        page: (args, data) ->
            pageId = args.page
            section = args.section or 'priority'
            console.log 'page', pageId, section
            @view.setPage pageId
            @view.getSection section


