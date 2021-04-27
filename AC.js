/**
 * @author Aaron Clinger - https://github.com/aaronclinger/ac.js
 */
(function(document, window) {
	'use strict';
	
	function ACElement(element) {
		var pub = {};
		
		pub.getElement = function() {
			return element;
		};
		
		pub.on = function(eventName, eventHandler, options) {
			element.addEventListener(eventName, eventHandler, options);
			
			return pub;
		};
		
		pub.off = function(eventName, eventHandler) {
			element.removeEventListener(eventName, eventHandler);
			
			return pub;
		};
		
		pub.height = function() {
			return element.offsetHeight;
		};
		
		pub.width = function() {
			return element.offsetWidth;
		};
		
		pub.offset = function() {
			var rect = element.getBoundingClientRect();
			
			return {
				top: rect.top + window.AC.pageY(),
				left: rect.left + window.AC.pageX()
			};
		};
		
		pub.style = function() {
			return element.style;
		};
		
		pub.data = function(id) {
			if (id) {
				return element.dataset[id];
			}
			
			return element.dataset;
		};
		
		pub.get = function(selector, onlyFirst) {
			return window.AC.get(selector, onlyFirst, element);
		};
		
		pub.prepend = function(el) {
			if (el.getElement) {
				el = el.getElement();
			}
			
			element.insertBefore(el, element.firstChild);
			
			return pub;
		};
		
		pub.append = function(el) {
			if (el.getElement) {
				el = el.getElement();
			}
			
			element.appendChild(el);
			
			return pub;
		};
		
		pub.remove = function() {
			if (element.parentNode) {
				element.parentNode.removeChild(element);
			}
			
			return pub;
		};
		
		pub.empty = function() {
			pub.setHTML(null);
			
			return pub;
		};
		
		pub.hasClass = function(className) {
			return element.classList.contains(className);
		};
		
		pub.addClass = function(className) {
			element.classList.add(className);
			
			return pub;
		};
		
		pub.removeClass = function(className) {
			element.classList.remove(className);
			
			return pub;
		};
		
		pub.toggleClass = function(className) {
			if (pub.hasClass(className)) {
				pub.removeClass(className);
			} else {
				pub.addClass(className);
			}
		};
		
		pub.setAttribute = function(name, value) {
			element.setAttribute(name, value);
			
			return pub;
		};
		
		pub.removeAttribute = function(name) {
			element.removeAttribute(name);
			
			return pub;
		};
		
		pub.getAttribute = function(name) {
			return element.getAttribute(name);
		};
		
		pub.setText = function(text) {
			element.textContent = text;
			
			return pub;
		};
		
		pub.getText = function() {
			return element.textContent;
		};
		
		pub.setHTML = function(html) {
			element.innerHTML = html;
			
			return pub;
		};
		
		pub.getHTML = function() {
			return element.innerHTML;
		};
		
		pub.getParent = function() {
			return window.AC.wrap(element.parentNode);
		};
		
		return pub;
	}
	
	function AC() {
		var pub            = {};
		var webpSupport    = null;
		var passiveSupport = null;
		
		var init = function() {
			Object.defineProperty(pub, 'SUPPORTS_PASSIVE', {
				get: doesSupportPassive
			});
			Object.defineProperty(pub, 'PASSIVE_PARAM', {
				get: function() {
					return pub.SUPPORTS_PASSIVE ? { passive: true } : false;
				}
			});
			
			pub.SUPPORTS_INTERSECTION = 'IntersectionObserver' in window;
		};
		
		pub.wrap = function(element) {
			if (element.length) {
				var list = [],
				    i    = -1;
				
				while (++i < element.length) {
					list.push(new ACElement(element[i]));
				}
				
				return list;
			}
			
			return new ACElement(element);
		};
		
		pub.ready = function(callback) {
			if (document.readyState === 'interactive' || document.readyState === 'complete') {
				callback();
			} else {
				document.addEventListener('DOMContentLoaded', callback);
			}
		};
		
		pub.get = function(selector, onlyFirst, scope) {
			var selectorType = onlyFirst ? 'querySelector' : 'querySelectorAll',
			    list,
			    el,
			    i;
			
			scope = scope || document;
			
			if (selector.indexOf('#') === 0 && selector.indexOf(' ') === selector.indexOf('.')) {
				selectorType = 'getElementById';
				selector     = selector.substr(1, selector.length);
			}
			
			el = scope[selectorType](selector);
			
			if (el.length === 0) {
				return null;
			} else if (el.length === 1 && onlyFirst) {
				return pub.wrap(el[0]);
			} else if (el.length > 0) {
				list = [];
				i    = -1;
				
				while (++i < el.length) {
					list.push(pub.wrap(el[i]));
				}
				
				return list;
			}
			
			return pub.wrap(el);
		};
		
		pub.getRequest = function(url, callback, errorCallback) {
			var request = new XMLHttpRequest();
			
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
		};
		
		pub.new = function(elString, namespace) {
			if (elString.indexOf('<') === 0) {
				return pub.wrap(pub.new('div').setHTML(elString).getElement().firstChild);
			}
			
			return pub.wrap(namespace ? document.createElementNS(namespace, elString) : document.createElement(elString));
		};
		
		pub.rateLimit = function(callback, limit) {
			var wait  = false,
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
		};
		
		pub.constrain = function(value, min, max) {
			return Math.min(Math.max(value, min), max);
		};
		
		pub.interpolate = function(begin, end, percent) {
			return begin + (end - begin) * percent;
		};
		
		pub.each = function(list, callback) {
			var i = -1,
			    l = list.length;
			
			while (++i < l) {
				if (callback(list[i], i) === false) {
					return;
				}
			}
		};
		
		pub.pageX = function() {
			return (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
		};
		
		pub.pageY = function() {
			return (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
		};
		
		pub.testSupportWebP = function(callback) {
			if (webpSupport !== null) {
				callback(webpSupport);
				return;
			}
			
			var img = new Image();
			
			img.onload = function() {
				webpSupport = (img.width > 0) && (img.height > 0);
				
				callback(webpSupport);
			};
			
			img.onerror = function() {
				webpSupport = false;
				
				callback(webpSupport);
			};
			
			img.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
		};
		
		var doesSupportPassive = function() {
			if (passiveSupport !== null) {
				return passiveSupport;
			}
			
			passiveSupport = false;
			
			try {
				var opts = Object.defineProperty({}, 'passive', {
					get: function() {
						passiveSupport = true;
					}
				});
				
				window.addEventListener('test', null, opts);
			} catch (e) {
				return false;
			}
			
			return passiveSupport;
		};
		
		init();
		
		return pub;
	}
	
	window.AC = AC();
}(document, window));
