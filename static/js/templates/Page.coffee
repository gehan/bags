define ->
    dust.compileAndLoad
        page: """
        <nav ref="leftNav" class="left">
            {>pageLeftNav/}
        </nav>
        <div class="page-body">
            <div ref="page-top">
                <p data-trigger="internet">Hello there i'm {page.name}</p>
                <select data-behavior="Test">
                    <option>Newest First</option>
                    <option>Oldest First</option>
                </select>
            </div>
            <ul ref="items">
            </ul>
        </div>
        """

        pageLeftNav: """
            <a href="/page/{pageId}/unread/" data-trigger="push">Unread</a>
            <a href="/page/{pageId}/priority/" data-trigger="push">Priority</a>
            <a href="/page/{pageId}/assigned/" data-trigger="push">Assigned</a>
        """

        item: """
        <li data-trigger="internet" data-behavior="Test">{id} - <em>{text}</em> - {description}</li>
        """
