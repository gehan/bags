define -> dust.compileAndLoad {

account: """
<nav class="left" data-behavior="Test">
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
    <strong>I like user innit</strong>
</p>
<p>
    <strong>I also like the internets</strong>
</p>
"""

channel: """
<p>
    I like channel innit
</p>
"""

}
