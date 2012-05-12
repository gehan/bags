/*
---

name: Element.Fragment.Overrides

description: Overrides typeOf and document.id to support a type of "fragment"

license: MIT-style

authors:
- Matt Cosentino

requires: core/1.4.5: [Element]

provides: [Element.Fragment.Overrides]

...
*/

window.typeOf = function(item){
	if (item == null) return 'null';
	if (item.$family) return item.$family();

	if (item.nodeName){
		if (item.nodeType == 1) return 'element';
		if (item.nodeType == 3) return (/\S/).test(item.nodeValue) ? 'textnode' : 'whitespace';
		if (item.nodeType == 11) return 'fragment';
	} else if (typeof item.length == 'number'){
		if (item.callee) return 'arguments';
		if ('item' in item) return 'collection';
	}

	return typeof item;
};

Document.implement('id', (function(){

	var types = {

		string: function(id, nocash, doc){
			id = Slick.find(doc, '#' + id.replace(/(\W)/g, '\\$1'));
			return (id) ? types.element(id, nocash) : null;
		},

		element: function(el, nocash){
			Slick.uidOf(el);
			if (!nocash && !el.$family && !(/^(?:object|embed)$/i).test(el.tagName)){
				var fireEvent = el.fireEvent;
				// wrapping needed in IE7, or else crash
				el._fireEvent = function(type, event){
					return fireEvent(type, event);
				};
				Object.append(el, Element.Prototype);
			}
			return el;
		},

		fragment: function(frag, nocash){
			Slick.uidOf(frag);
			if (!nocash && !frag.$family){
				Object.append(frag, Fragment.Prototype);
			}
			return frag;
		},

		object: function(obj, nocash, doc){
			if (obj.toElement) return types.element(obj.toElement(doc), nocash);
			return null;
		}

	};

	types.textnode = types.whitespace = types.window = types.document = function(zero){
		return zero;
	};

	return function(el, nocash, doc){
		if (el && el.$family && el.uniqueNumber) return el;
		var type = typeOf(el);
		return (types[type]) ? types[type](el, nocash, doc || document) : null;
	};

})());
