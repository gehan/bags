define(['ko', 'bags/Template'],
function(ko, Template){;
var ViewModel, pushHandler;

pushHandler = function(event) {
  var element, href;

  element = event.target;
  event.preventDefault();
  href = element.get('href');
  return History.pushState(null, null, href);
};

ko.bindingHandlers.pushState = {
  init: function(element, valueAccessor) {
    element.addEvent('click', pushHandler);
    return ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
      return element.removeEvent('click', pushHandler);
    });
  }
};

ko.bindingHandlers.editable = {
  init: function(element, valueAccessor, allBindingsAccessor) {
    var blurFn, editFn, options;

    options = allBindingsAccessor().jeditableOptions || {};
    if (!options.onblur) {
      options.onblur = 'submit';
    }
    editFn = function() {
      element.contentEditable = true;
      return element.focus();
    };
    blurFn = function() {
      valueAccessor()(element.get('text'));
      return element.contentEditable = false;
    };
    element.addEvents({
      click: editFn,
      blur: blurFn
    });
    return ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
      return element.removeEvents({
        click: editFn,
        blur: blurFn
      });
    });
  },
  update: function(element, valueAccessor) {
    var value;

    value = ko.utils.unwrapObservable(valueAccessor());
    return $(element).set('html', value);
  }
};

ko.bindingHandlers.stopBinding = {
  init: function() {
    return {
      controlsDescendantBindings: true
    };
  }
};

ko.virtualElements.allowedBindings.stopBinding = true;

ViewModel = new Class({
  Implements: [Options, Events, Template],
  options: {
    template: null
  },
  init: function() {},
  properties: function() {},
  initialize: function(element, options) {
    var el;

    this.element = element;
    this.setOptions(options);
    this.init();
    this.properties();
    if (this.options.template) {
      el = this.renderTemplate(this.options.template);
      this.element.adopt(el);
    }
    this.applyBindings();
    return this;
  },
  computed: function(fn, bind) {
    return ko.computed(fn, bind);
  },
  observable: function(value) {
    return ko.observable(value);
  },
  observableArray: function(value) {
    if (value == null) {
      value = [];
    }
    return ko.observableArray(value);
  },
  applyBindings: function() {
    return ko.applyBindings(this, this.element);
  },
  destroy: function() {
    return ko.cleanNode(this.element);
  }
});

return ViewModel;

});
