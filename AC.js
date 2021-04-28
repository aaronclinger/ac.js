/**
 * @author Aaron Clinger - https://github.com/aaronclinger/ac.js
 */
export default class AC {
	
	static get SUPPORTS_INTERSECTION() {
		return 'IntersectionObserver' in window;
	}
	
	static get SUPPORTS_PASSIVE() {
		if (AC._passiveSupport !== undefined) {
			return AC._passiveSupport;
		}
		
		AC._passiveSupport = false;
		
		try {
			let opts = Object.defineProperty({}, 'passive', {
				get: function() {
					AC._passiveSupport = true;
				}
			});
			
			window.addEventListener('test', null, opts);
		} catch (e) {
			return false;
		}
		
		return AC._passiveSupport;
	}
	
	static get PASSIVE_PARAM() {
		return AC.SUPPORTS_PASSIVE ? { passive: true } : false;
	}
	
	static ready(callback) {
		if (document.readyState === 'interactive' || document.readyState === 'complete') {
			callback();
		} else {
			document.addEventListener('DOMContentLoaded', callback);
		}
	}
	
	static get(selector, onlyFirst, scope) {
		let selectorType = onlyFirst ? 'querySelector' : 'querySelectorAll';
		
		scope = scope || document;
		
		if (selector.indexOf('#') === 0 && selector.indexOf(' ') === selector.indexOf('.')) {
			selectorType = 'getElementById';
			selector     = selector.substr(1, selector.length);
		}
		
		return scope[selectorType](selector);
	}
	
	static wrap(element) {
		if (element.length) {
			let list = [],
				i    = -1;
			
			while (++i < element.length) {
				list.push(new AC(element[i]));
			}
			
			return list;
		}
		
		return new AC(element);
	}
	
	static getRequest(url, callback, errorCallback) {
		let request = new XMLHttpRequest();
		
		request.open('GET', url, true);
		
		request.onload = function() {
			if (request.status >= 200 && request.status < 400) {
				if (callback) {
					callback(request.responseText);
				}
			} else {
				if (errorCallback) {
					errorCallback();
				}
			}
		};
		
		request.onerror = errorCallback;
		
		request.send();
		
		return request;
	}
	
	static new(elString, namespace) {
		if (elString.indexOf('<') === 0) {
			return AC.wrap(AC.new('div').setHTML(elString).getElement().firstChild);
		}
		
		return AC.wrap(namespace ? document.createElementNS(namespace, elString) : document.createElement(elString));
	}
	
	static rateLimit(callback, limit) {
		let wait  = false,
			queue = false;
		
		function delay() {
			setTimeout(function() {
				if (queue) {
					callback.call();
					
					queue = false;
					
					delay();
				} else {
					wait = false;
				}
			}, limit);
		}
		
		return function() {
			if ( ! wait) {
				callback.call();
				
				wait = true;
				
				delay();
			} else {
				queue = true;
			}
		};
	}
	
	static constrain(value, min, max) {
		return Math.min(Math.max(value, min), max);
	}
	
	static interpolate(begin, end, percent) {
		return begin + (end - begin) * percent;
	}
	
	static each(list, callback) {
		let i = -1,
			l = list.length;
		
		while (++i < l) {
			if (callback(list[i], i) === false) {
				return;
			}
		}
	}
	
	static pageX() {
		return (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
	}
	
	static pageY() {
		return (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
	}
	
	static testSupportWebP(callback) {
		if (AC._webpSupport !== undefined) {
			callback(AC._webpSupport);
			return;
		}
		
		let img = new Image();
		
		img.onload = function() {
			AC._webpSupport = (img.width > 0) && (img.height > 0);
			
			callback(AC._webpSupport);
		};
		
		img.onerror = function() {
			AC._webpSupport = false;
			
			callback(AC._webpSupport);
		};
		
		img.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
	}
	
	constructor(element) {
		this._el = element;
	}
	
	getElement() {
		return this._el;
	}
	
	on(eventName, eventHandler, options) {
		this._el.addEventListener(eventName, eventHandler, options);
		
		return this;
	}
	
	off(eventName, eventHandler) {
		this._el.removeEventListener(eventName, eventHandler);
		
		return this;
	}
	
	height() {
		return this._el.offsetHeight;
	}
	
	width() {
		return this._el.offsetWidth;
	}
	
	offset() {
		let rect = this._el.getBoundingClientRect();
		
		return {
			top: rect.top + window.AC.pageY(),
			left: rect.left + window.AC.pageX()
		}
	}
	
	style() {
		return this._el.style;
	}
	
	data(id) {
		if (id) {
			return this._el.dataset[id];
		}
		
		return this._el.dataset;
	}
	
	get(selector, onlyFirst) {
		return window.AC.get(selector, onlyFirst, this._el);
	}
	
	prepend(el) {
		if (el.getElement) {
			el = el.getElement();
		}
		
		this._el.insertBefore(el, this._el.firstChild);
		
		return this;
	}
	
	append(el) {
		if (el.getElement) {
			el = el.getElement();
		}
		
		this._el.appendChild(el);
		
		return this;
	}
	
	remove() {
		if (this._el.parentNode) {
			this._el.parentNode.removeChild(this._el);
		}
		
		return this;
	}
	
	empty() {
		this.setHTML(null);
		
		return this;
	}
	
	hasClass(className) {
		return this._el.classList.contains(className);
	}
	
	addClass(className) {
		this._el.classList.add(className);
		
		return this;
	}
	
	removeClass(className) {
		this._el.classList.remove(className);
		
		return this;
	}
	
	toggleClass(className) {
		if (this.hasClass(className)) {
			this.removeClass(className);
		} else {
			this.addClass(className);
		}
	}
	
	setAttribute(name, value) {
		this._el.setAttribute(name, value);
		
		return this;
	}
	
	removeAttribute(name) {
		this._el.removeAttribute(name);
		
		return this;
	}
	
	getAttribute(name) {
		return this._el.getAttribute(name);
	}
	
	setText(text) {
		this._el.textContent = text;
		
		return this;
	}
	
	getText() {
		return this._el.textContent;
	}
	
	setHTML(html) {
		this._el.innerHTML = html;
		
		return this;
	}
	
	getHTML() {
		return this._el.innerHTML;
	}
	
	getParent() {
		return window.AC.wrap(this._el.parentNode);
	}
}
