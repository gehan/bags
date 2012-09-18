(function() {

  define(function() {
    return new Class({
      Implements: [Options, Events],
      Binds: ['_clickHandler', '_windowClickHandler'],
      options: {
        dropdownSelector: '[data-dropdown]',
        allowClicks: false
      },
      initialize: function(handle, options) {
        this.handle = handle;
        this.setOptions(options);
        this.el = this.handle.getElement('[data-dropdown]');
        this.attachEvents();
        return this;
      },
      attachEvents: function() {
        return this.handle.addEvent('click', this._clickHandler);
      },
      isVisible: function() {
        return (this.el != null) && this.el.isVisible();
      },
      show: function() {
        this.el.show();
        this.handle.addClass('active');
        return document.addEvent('mouseup', this._windowClickHandler);
      },
      hide: function() {
        this.el.hide();
        this.handle.removeClass('active');
        return document.removeEvent('mouseup', this._windowClickHandler);
      },
      _clickHandler: function(e) {
        if (this.options.allowClicks && this.el.contains(e.target) && !(e.target.get('data-dropdown-closeonclick') != null)) {
          return;
        }
        if (!this.isVisible()) {
          return this.show();
        } else {
          return this.hide();
        }
      },
      _windowClickHandler: function(e) {
        if (!this.isVisible()) {
          return;
        }
        if (this.el.contains(e.target) || this.handle.contains(e.target) || this.handle === e.target) {
          return;
        }
        return this.hide();
      }
    });
  });

}).call(this);