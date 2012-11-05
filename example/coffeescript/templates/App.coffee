define -> dust.compileAndLoad {

base: """
<body>
    <header class="main">
        <a href="/" data-trigger="push">Home</a>
        <a href="/page/1/" data-trigger="push">Page 1</a>
        <a href="/page/2/" data-trigger="push">Page 2</a>
        <a href="/account/" data-trigger="push">Account 1</a>
    </header>
    <div ref="body" class="body">
        <p data-behavior="Test">Hello there look at the internets!</p>
    </div>
</body>
"""

}
