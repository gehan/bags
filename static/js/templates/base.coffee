do ->
    templates =
        base: """
        <body>
            <header class="main">
                <a href="/page/1/" data-trigger="push">Page 1</a>
                <a href="/page/2/" data-trigger="push">Page 2</a>
                <a href="/account/" data-trigger="push">Account 1</a>
            </header>
            <div ref="body" class="body">
            </div>
        </body>
        """

        page: """
        <nav ref="leftNav" class="left">
            {>pageLeftNav/}
        </nav>
        <div class="page-body">
            <p>
                Hello there i'm page {pageId} section {unread}
            </p>
            <ul ref="items">
            </ul>
        </div>
        """

        pageLeftNav: """
            <a href="/page/{pageId}/unread/" data-trigger="push">Subsection 1</a>
            <a href="/page/{pageId}/priority/" data-trigger="push">SubSection 2</a>
            <a href="/page/{pageId}/assigned/" data-trigger="push">SubSection 3</a>
        """

        account: """
        <nav class="left">
            <a href="/account/user/" data-trigger="push">User</a>
            <a href="/account/channel/" data-trigger="push">Channel face</a>
        </nav>
        <div class="page-body" ref="body">
            <p>
                Hello there i'm an account
            </p>
            <p ref="accountBody">
            </p>
        </div>
        """

        user: """
        <p>
            I like user innit
        </p>
        """

        channel: """
        <p>
            I like channel innit
        </p>
        """

        item: """
        <li>{id} - <em>{text}</em> - {description}</li>
        """

        body: """
        """

    for name, content of templates
        compiled = dust.compile content, name
        dust.loadSource compiled

