Browser.shit = (Browser.ie6 || Browser.ie7 || Browser.ie8 || false);
Element.extend({
    inDOM: function(element) {
        while (element) {
            if (element === document) {
                return true;
            }
            element = element.parentNode;
        }
        return false;
    }
});
Element.implement({
    isHidden: function(){
        var w = this.offsetWidth, h = this.offsetHeight,
        force = (this.tagName === 'TR');
        return (w===0 && h===0 && !force) ? true : (w!==0 && h!==0 && !force) ? false : this.getStyle('display') === 'none';
    },
    isVisible: function(){
        return !this.isHidden();
    },

    showResizeImage: function(width){
        if (width === undefined) width = 90;
        this.set({
            'styles': {
                'display': 'block'
            }
        });
        s = this.getSize();
        if (s.x>width) {
            // Scale down
            sx = width;
            sy = s.y/s.x * width;
        } else {
            sx = s.x;
            sy = s.y;
        }
        this.set({
            'height': sy,
            'width': sx
        });
    },
    checkScroll: function(container, duration, moveExtra) {
        container = container || this.getParent();
        duration = duration || 150;
        moveExtra = moveExtra || 0;
        var isFixed = container.getStyle('position') === 'fixed',
            pos = this.getPosition(container),
            scroll = function() {
                return new Fx.Scroll(container, {
                    'duration': duration
                });
            };
        if (isFixed) {
            pos.y -= window.getScroll().y;
        }
        if (container.getSize().y < pos.y + this.getSize().y) {
            scroll().start(0, container.getScroll().y + pos.y + moveExtra + this.getSize().y - container.getSize().y);
        } else if (pos.y < 0) {
            scroll().start(0, container.getScroll().y + pos.y - moveExtra);
        }
    },
    setCaretPosition: function(pos) {
        if(this.setSelectionRange) {
            this.focus();
            this.setSelectionRange(pos,pos);
        } else if (this.createTextRange) {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    },
    getInnerSize: function() {
        if (Browser.ie6 || Browser.ie7) {
            return this.getInnerSizeAlt();
        }
        var padding = this.getPadding();
        return {
            'x': this.clientWidth - padding.x,
            'y': this.clientHeight - padding.y
        };
    },
    getInnerSizeAlt: function() {
        var padding = this.getPadding(),
            border = this.getBorderWidth(),
            size = this.getSize();
        return {
            'x': size.x - padding.x - border.x,
            'y': size.y - padding.y - border.y
        };
    },
    getPadding: function() {
        return this.getMeasurement('padding');
    },
    getBorderWidth: function() {
        return this.getMeasurement('border-width');
    },
    getMargin: function() {
        return this.getMeasurement('margin');
    },
    getMeasurement: function(property) {
        var measurement = this.getStyle(property).split(' ').invoke('toFloat').invoke('round');
        return {
            'top': measurement [0],
            'right': measurement [1],
            'bottom': measurement [2],
            'left': measurement[3],
            'y': measurement[0] + measurement[2],
            'x': measurement[1] + measurement[3]
        };
    },
    /* Gets the offset of each EDGE from the document top/left as appropriate
     */
    getOffset: function(parent) {
        var pos = this.getPosition(parent),
            size = this.getSize();
        return {
            'top': pos.y,
            'bottom': pos.y + size.y,
            'left': pos.x,
            'right': pos.x + size.x
        };
    },
    getValue: function(returnAllStringForAll) {
        // If multi select then do iteration
        if (this.get('tag') === 'select' && this.get('multiple')) {
            var opts = Array.from(this.options),
                selected = opts.filter(function(opt){
                    return opt.selected;
                }).map(function(opt){
                    return opt.value;
                });
            if (returnAllStringForAll && opts.length === selected.length) {
                return 'all';
            } else {
                return selected.join(',');
            }
        } else {
            return this.get('value');
        }
    },
    setValue: function(value, selectAllForStringAll) {
        // If multi select then do iteration
        if (this.get('tag') === 'select' && this.get('multiple')) {
            var opts = Array.from(this.options),
                valueArr = value.split(',');
            if (selectAllForStringAll && value === 'all') {
                opts.each(function(opt) {
                    opt.set('selected', true);
                });
            } else {
                opts.each(function(opt) {
                    var selected = valueArr.contains(opt.get('value'));
                    opt.set('selected', selected);
                });
            }
        } else {
            this.set('value', value);
        }
    },
    fadeCb: function(how, cb, options) {
        var fade = this.get('tween'), o = 'opacity', toggle, fadeObj;
        if (options) Object.merge(fade.options, options);
        how = [how, 'toggle'].pick();
        switch (how){
            case 'in': fadeObj = fade.start(o, 1); break;
            case 'out': fadeObj = fade.start(o, 0); break;
            case 'show': fadeObj = fade.set(o, 1); break;
            case 'hide': fadeObj = fade.set(o, 0); break;
            case 'toggle':
                var flag = this.retrieve('fade:flag', this.getStyle('opacity') == 1);
                fadeObj = fade.start(o, (flag) ? 0 : 1);
                this.store('fade:flag', !flag);
                toggle = true;
            break;
            default: fadeObj = fade.start(o, arguments);
        }
        if (!toggle) this.eliminate('fade:flag');
        if (cb) fadeObj.chain(cb);
        return this;
    },
    growWidth: function(size, cb){
        var grow = this.get('tween');
        grow.start('width', size);
        if (cb) grow.chain(cb);
    },
    addTooltip: function(html, options) {
        if (this.tooltip) {
            this.tooltip.setTip(html);
        } else {
            this.tooltip = new Tooltip(this, html, options);
        }
    },
    removeTooltip: function() {
        if (this.tooltip) {
            this.tooltip.destroy();
            this.tooltip = null;
        }
    },
    addChildEvent: function(selector, events) {
        var el = this.getElement(selector);
        if (el) el.addEvents(events);
    },
    addChildEvents: function(childEvents) {
        var self = this;
        Object.each(childEvents, function(events, selector) {
            self.addChildEvent(selector, events);
        });
    },
    addDelegatedEvents: function(events) {
        Object.each(events, function(fn, eventKey) {
            this.addDelegatedEvent(eventKey, fn);
        }, this);
    },
    addDelegatedEvent: function(eventKey, fn) {
        eventKey = eventKey.split(":");
        var delegationEvent = "{eventType}:relay({eventSelector})".substitute({
                eventType: eventKey[0],
                eventSelector: eventKey[1]
            });
        this.addEvent(delegationEvent, fn);
    },
    flash: function(blue) {
        var self = this,
            colour = '#ff7';
        if (blue) colour = '#44B7D5';
        new Chain().chain(function() {
            self.setStyle('background-color', colour);
            this.callChain();
        }).wait(750).chain(function() {
            self.setStyle('background-color', null);
            this.callChain();
        }).wait(250).chain(function() {
            self.setStyle('background-color', colour);
            this.callChain();
        }).wait(250).chain(function() {
            self.setStyle('background-color', null);
            this.callChain();
        }).wait(250).chain(function() {
            self.setStyle('background-color', colour);
            this.callChain();
        }).wait(500).chain(function() {
            self.setStyle('background-color', null);
        }).callChain();
    }
});

Object.extend({
    setInvFilter: function(object, keys) {
        var results = {},
            obj_keys = this.keys(object);
        for (var i = 0, l = obj_keys.length; i < l; i++){
            var k = obj_keys[i];
            if (!keys.contains(k)) results[k] = object[k];
        }
        return results;
    },
    setFilter: function(object, keys) {
        var results = {},
            obj_keys = this.keys(object);
        for (var i = 0, l = keys.length; i < l; i++){
            var k = keys[i];
            if (obj_keys.contains(k)) results[k] = object[k];
        }
        return results;
    },
    combine: function() {
        var arr = [{}].append(Array.from(arguments));
        return this.merge.apply(this, arr);
    },
    /* Takes any function from events and chains them
     * before any matching functions in options and
     * becomes main func in options
     */
    chainEvents: function(options, events, preOrPost) {
        if (preOrPost === undefined) {
            preOrPost = 'pre';
        }
        this.each(events, function(fn, event){
            var original = options[event];
            var wrap = function() {
                var ret;
                if (preOrPost === 'pre') {
                    ret = fn.apply(this, arguments);
                }
                if (original) {
                    ret = original.apply(this, arguments);
                }
                if (preOrPost === 'post') {
                    ret =  fn.apply(this, arguments);
                }
                return ret;
            };
            options[event] = wrap;
        });
    }
});

Array.implement({
    sortByField: function(field) {
        return this.sort(function(a, b) {
            return a[field].toLocaleLowerCase().localeCompare(b[field].toLocaleLowerCase());
        });
    },
    addChildEvents: function(childEvents) {
        this.each(function(el) {
            el.addChildEvents(childEvents);
        });
    }
});

String.implement({
    pad: function(where) {
        if (where == 'l') {
            return " " + this;
        } else if (where == 'r') {
            return this + ' ';
        } else {
            return ' ' + this + ' ';
        }
    },
    formatNum: function() {
        var last = this.substr(-1),
            number = Number.from(this).format();
        if (last === '+') {
            number += last;
        }
        return number;
    },
    isMaxCount: function() {
        return this.substr(-1) == '+';
    }
});

Function.implement({
    waitUntilUp: function() {
        var self = this,
            run = false,
            upFn, eName;
        return function(e) {
            if (!run) {
                upFn = function() {
                    run = false;
                    e.target.removeEvent(eName, upFn);
                };
                eName = 'keyup:keys({key})'.substitute(e);
                e.target.addEvent(eName, upFn);
                run = true;
                return self(e);
            }
        };
    }
});

Number.implement({
    pluralize: function(word) {
        var singular = word,
            plural = word + 's';
        if (word.substr(-1) === 'y') {
            plural = word.substr(0, word.length-1) + 'ies';
        }
        return "{number} {word}".substitute({
            number: this.format(0),
            word: this.toInt() === 1 ? singular : plural
        });
    }
});
// Static class methods
Class.Mutators.Static = function(members) {
    this.extend(members);
};

Slick.definePseudo('hasnt-class', function(classNames){
    var self = $(this);
    return classNames.split(',').every(function(className) {
        return !self.hasClass(className);
    });
});

// Add paste event
Object.append(Element.NativeEvents, {
    'paste': 2, 'input': 2
});
Element.Events.paste = {
    base : (Browser.opera || Browser.firefox2 )? 'input': 'paste',
    condition: function(e){
        this.fireEvent('paste', e, 1);
        return false;
    }
};

// Kwargs hackery
parseKwargs = function(kwargs, defaults){
    if (typeOf(kwargs) !== 'object') {
        return defaults;
    } else {
        return Object.merge(defaults, kwargs);
    }
};

// Shortcut to go to hash
function h(hash) {
    window.location.hash = hash;
}

// Element constructors
$n = function(tag, opts) {
    return new Element(tag, opts);
};
$n.extend({
    inputRow: function(opts) {
        var el = this('div', {
            'class': opts.rowClass || 'input-text-wrap'
        });
        if ((opts.label || 'left') === 'left') {
            el.adopt(
                this('label', {
                    'for': opts.id,
                    'text': opts.text
                }),
                opts.input
            );
        } else {
            el.adopt(
                opts.input,
                this('label', {
                    'for': opts.id,
                    'text': opts.text
                })
            );
        }
        if (opts.id) {
            opts.input.set('id', opts.id);
        }
        return el;
    },
    inputRadio: function(opts) {
        opts.name = opts.name || opts.id;
        delete opts.text;
        opts.type = 'radio';
        opts['class'] = opts['class'] ? opts['class'] + ' toStyle' : 'toStyle';
        return new Element('input', opts);
    },
    inputRadioRow: function(opts) {
        return this.inputRow({
            'id': opts.id,
            'text': opts.text,
            'input': this.inputRadio(opts),
            'rowClass': opts.rowClass || 'input-radio-wrap',
            'label': opts.label || 'left'
        });
    },
    suggestedInputRow: function(opts) {
        return this.inputRow({
            'text': opts.text,
            'id': opts.id,
            'input': (delete opts.text) && this('div', opts)
        });
    }
});

function loadJsOrCss(url, filetype, callback) {
    var el;
    if (filetype=="js") {
        el = document.createElement('script');
        el.setAttribute("type", "text/javascript");
        el.setAttribute("src", url);
    } else if (filetype=="css") {
        el = document.createElement("link");
        el.setAttribute("rel", "stylesheet");
        el.setAttribute("type", "text/css");
        el.setAttribute("href", url);
    }
    if (typeof el != "undefined") {
        document.getElementsByTagName("head")[0].appendChild(el);
    }
    if (callback !== undefined) {
        var timerId = window.setInterval(function() {
            if (callback()) {
                window.clearInterval(timerId);
            }
        }, 100);
    }
}
