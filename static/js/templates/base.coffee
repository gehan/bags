do ->
    templates =
        base: """
        <body>
            <header>
                <a href="/page/1/unread/" data-trigger="push">Section 1</a>
                <a href="/account/channels/1/" data-trigger="push">Section 2</a>
                <a href="/account/channels/2/" data-trigger="push">Section 3</a>
            </header>
            <div ref="body">
            </div>
        </body>
        """

        page: """
        <p>
            Hello there i'm a page
        </p>
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

