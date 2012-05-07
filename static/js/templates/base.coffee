do ->
    templates =
        base: """
        <body>
            <header>
                <a href="/page/1/" data-trigger="push">Page 1</a>
                <a href="/page/2/" data-trigger="push">Page 2</a>
                <a href="/account/channels/1/" data-trigger="push">Account</a>
            </header>
            <div ref="body">
            </div>
        </body>
        """

        page: """
        <nav ref="leftNav">
            {>pageLeftNav/}
        </nav>
        <p>
            Hello there i'm a page
        </p>
        """

        pageLeftNav: """
            <a href="/page/{pageId}/unread/" data-trigger="push">Subsection 1</a>
            <a href="/page/{pageId}/priority/" data-trigger="push">SubSection 2</a>
            <a href="/page/{pageId}/assigned/" data-trigger="push">SubSection 3</a>
        """

        account: """
        <p>
            Hello there i'm an account
        </p>
        """

        body: """
        """

    for name, content of templates
        compiled = dust.compile content, name
        dust.loadSource compiled

