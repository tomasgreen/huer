/**!
 * # huer
 * Author: Tomas Green (http://www.github.com/tomasgreen)
 * License: MIT
 * Version: 0.1.0
 */
(function () {
	'use strict';
	var _animationEndEvents = 'webkitAnimationEnd mozAnimationEnd msAnimationEnd oAnimationEnd animationend';
	var _animationStartEvents = 'webkitAnimationStart mozAnimationStart msAnimationStart oAnimationStart animationstart';
	var _isTouchDevice = 'ontouchstart' in document.documentElement;

	function _removeNode(element) {
		if (!element || !element.parentNode) return;
		element.parentNode.removeChild(element);
		return undefined;
	}

	function _detectCSSFeature(featurename) {
		var feature = false,
			domPrefixes = 'Webkit Moz ms O'.split(' '),
			elm = document.createElement('div'),
			featurenameCapital = null;

		featurename = featurename.toLowerCase();
		if (elm.style[featurename] !== undefined) feature = true;
		if (feature === false) {
			featurenameCapital = featurename.charAt(0).toUpperCase() + featurename.substr(1);
			for (var i = 0; i < domPrefixes.length; i++) {
				if (elm.style[domPrefixes[i] + featurenameCapital] !== undefined) {
					feature = true;
					break;
				}
			}
		}
		return feature;
	}

	function _toArray(els) {
		return Array.prototype.slice.call(els, 0);
	}

	function _createElement(type, attributes, parent, html) {
		var el;
		if (type.indexOf('.') !== -1) {
			var arr = type.split('.');
			type = arr[0];
			el = document.createElement(arr[0]);
			arr.shift();
			el.setAttribute('class', arr.join(' '));
		} else {
			el = document.createElement(type);
		}
		for (var i in attributes) el.setAttribute(i, attributes[i]);
		if (parent) parent.appendChild(el);
		if (html) el.innerHTML = html;
		return el;
	}

	function _on(el, events, func, useCapture) {
		if (!el || (el.length === 0 && el != window)) return;
		if (useCapture === undefined) useCapture = false;
		if (el.length) {
			for (var i = 0; i < el.length; i++) {
				_on(el[i], events, func, useCapture);
			}
			return;
		}
		var ev = events.split(' ');
		for (var e in ev) {
			el.addEventListener(ev[e], func, useCapture);
		}
	}

	function _stopEventPropagation(e) {
		if (typeof e.stopPropagation === 'function') {
			e.stopPropagation();
			e.preventDefault();
		} else if (window.event && window.event.hasOwnProperty('cancelBubble')) {
			window.event.cancelBubble = true;
		}
	}

	function _tapOn(el, func) {
		if (!_isTouchDevice) {
			_on(el, 'click', func);
			return;
		}
		var t = false;
		_on(el, 'touchstart', function (ev) {
			t = true;
		});
		_on(el, 'touchend', function (ev) {
			if (t) {
				func();
				_stopEventPropagation(ev);
			}
		});
		_on(el, 'touchcancel touchleave touchmove', function (ev) {
			t = false;
		});
	}

	function _tapOff(el) {
		_off(el, 'touchstart touchend touchcancel click');
	}

	function _off(el, events, func) {
		if (!el || (el.length === 0 && el != window)) return;
		if (el.length) {
			for (var i = 0; i < el.length; i++) {
				_off(el[i], events, func);
			}
			return;
		}
		var ev = events.split(' ');
		for (var e in ev) {
			el.removeEventListener(ev[e], func);
		}
	}

	function _addClass(el, className) {
		if (el.classList) {
			var arr = className.split(' ');
			for (var i in arr) {
				el.classList.add(arr[i]);
			}
		} else el.className += ' ' + className;
	}

	function _removeClass(el, className) {
		if (el.classList) {
			var arr = className.split(' ');
			for (var i in arr) {
				el.classList.remove(arr[i]);
			}
		} else el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
	}

	function _isObject(obj) {
		return obj === Object(obj);
	}

	function _centerize(el) {
		el.style.marginTop = ((el.offsetHeight / 2) * -1) + 'px';
		el.style.marginLeft = ((el.offsetWidth / 2) * -1) + 'px';
	}

	var defaults = {
		html: 'Your view is empty.',
		showOnInit: true,
		useEffects: true,
		clickOutsideToDismiss: false,
		overlayBackgroundColor: null,
		featureFailCallback: null,
		blurContent: true,
		blurAllSiblings: false,
		blurSelector: '[data-huer-effect="blur"]',
		wrapContent: true,
		centerize: true
	};
	var Self = function () {
		var options;
		var _this = this;
		if (_isObject(arguments[0])) {
			options = arguments[0];
		} else if (arguments[0]) {
			options = {
				html: arguments[0]
			};
		}
		_this.element = document.body;
		_this.opt = {};

		if (options === undefined) options = {};
		for (var i in defaults) {
			_this.opt[i] = (options[i] !== undefined) ? options[i] : defaults[i];
		}

		var featureSupport = {
			animation: _detectCSSFeature('animation'),
			transition: _detectCSSFeature('transition'),
			transform: _detectCSSFeature('transform'),
			filter: _detectCSSFeature('filter'),
			query: document.querySelectorAll !== undefined
		};
		if (!featureSupport.filter) _this.opt.blurContent = false;
		if (!featureSupport.animation || !featureSupport.transition || !featureSupport.transform) _this.opt.useEffects = false;
		if (!featureSupport.query) {
			if (_this.opt.featureFailCallback) _this.opt.featureFailCallback(featureSupport);
			else alert('Your browser is lacking certain features. Please update to a modern browser.');
			return;
		}

		var container = _createElement('div.huer-container');
		var overlay = _createElement('div.huer-overlay', null, container);
		var body = _createElement('div.huer-body', null, container);
		if (_this.opt.overlayBackgroundColor) {
			overlay.style.backgroundColor = _this.opt.overlayBackgroundColor;
		}
		if (_this.opt.wrapContent) {
			_createElement('div.huer-content-wrapper', null, body, _this.opt.html);
		} else {
			body.innerHTML = _this.opt.html;
		}
		_this.container = container;
		_this.overlay = overlay;
		_this.body = body;
		_this.element.appendChild(_this.container);

		_this.click('[data-destroy="click"]', function () {
			_this.destroy();
		});
		_this.click(_this.overlay, _this.onOverlayClick);
		if (_this.opt.showOnInit) {
			_this.show();
		}
	};
	Self.prototype.blurContent = function () {
		var _this = this;
		if (!_this.opt.blurContent) return;
		var els = (_this.opt.blurAllSiblings) ? _this.container.parentNode.childNodes : document.querySelectorAll(_this.opt.blurSelector);
		for (var i = 0; i < els.length; i++) {
			if (els[i] == _this.container) continue;
			_addClass(els[i], 'huer-blur');
		}
	};
	Self.prototype.focusContent = function () {
		var _this = this;
		if (!_this.opt.blurContent) return;
		var els = document.querySelectorAll('.huer-blur');

		function animationEnd() {
			for (var i = 0; i < els.length; i++) {
				_removeClass(els[i], 'huer-focus');
				_off(els[i], _animationEndEvents, animationEnd);
			}
		}
		for (var i = 0; i < els.length; i++) {
			_removeClass(els[i], 'huer-blur');
			_addClass(els[i], 'huer-focus');
			_on(els[i], _animationEndEvents, animationEnd);
		}
	};
	Self.prototype.toggleEffects = function (finishedCallback) {
		var _this = this;
		if (!_this.opt.useEffects) {
			if (finishedCallback) finishedCallback();
			return;
		}
		if (_this.isVisible) {
			_addClass(_this.overlay, 'huer-fade-out');
			_addClass(_this.body, 'huer-zoom-out');
			_this.focusContent();

			var animationOutEnd = function () {
				_removeClass(_this.overlay, 'huer-fade-out');
				_removeClass(_this.body, 'huer-zoom-out');
				_this.container.style.display = 'none';
				if (finishedCallback) finishedCallback();
				_off(_this.body, _animationEndEvents, animationOutEnd);
			};
			_on(_this.body, _animationEndEvents, animationOutEnd);
		} else {
			_addClass(_this.overlay, 'huer-fade-in');
			_addClass(_this.body, 'huer-bounce-in');
			_this.blurContent();

			var animationInStart = function () {
				_off(_this.body, _animationStartEvents, animationInStart);
			};

			var animationInEnd = function () {
				_removeClass(_this.overlay, 'huer-fade-in');
				_removeClass(_this.body, 'huer-bounce-in');
				if (finishedCallback) finishedCallback();
				_off(_this.body, _animationEndEvents, animationInEnd);
			};
			_on(_this.body, _animationStartEvents, animationInStart);
			_on(_this.body, _animationEndEvents, animationInEnd);
		}
	};
	Self.prototype.show = function (callback) {
		var _this = this;
		if (_this.isVisible) return;

		_this.container.style.visibility = 'hidden';
		_this.container.style.display = 'block';

		if (_this.opt.centerize) _centerize(_this.body);

		_this.container.style.visibility = 'visible';

		_this.toggleEffects(callback);

		this.onOverlayClick = function () {
			if (_this.opt.clickOutsideToDismiss && !_this.isBusy()) {
				_this.destroy();
			}
		};
		this.onWindowKeydown = function (e) {
			var keyCode = e.keyCode || e.which;
			if ([9, 13, 32, 27].indexOf(keyCode) === -1) {
				//_stopEventPropagation(e);
				return;
			}
			if (keyCode === 9) {
				//var el = e.target || e.srcElement;
				_stopEventPropagation(e);
				_this.focusElement();
			}
		};
		this.focusElement = function (reset) {
			if (reset) _this.lastTabindex = null;
			var els = _this.query('[tabindex]');
			if (!els.length) {
				_this.overlay.focus();
				return;
			}
			els = _toArray(els);
			els.sort(function (a, b) {
				if (!a.getAttribute || !b.getAttribute) return -1;
				return parseInt(a.getAttribute('tabindex')) - parseInt(b.getAttribute('tabindex'));
			});
			if (_this.lastTabindex) {
				for (var e = 0; e < els.length; e++) {
					if (els[e].getAttribute('tabindex') == _this.lastTabindex && e < els.length - 1) {
						els[e + 1].focus();
						_this.lastTabindex = els[e + 1].getAttribute('tabindex');
						return;
					}
				}
			}
			els[0].focus();
			_this.lastTabindex = els[0].getAttribute('tabindex');
		};
		_on(window, 'keydown', _this.onWindowKeydown);
		_this.focusElement(true);
		_this.isVisible = true;
	};
	Self.prototype.hide = function (callback) {
		var _this = this;

		if (!_this.isVisible) return;

		_off(window, 'resize', _this.onWindowResize);
		_off(window, 'keydown', _this.onWindowKeydown);

		_this.toggleEffects(callback);
		_this.isVisible = false;
	};
	Self.prototype.getHtml = function () {
		return this.container;
	};
	Self.prototype.query = function (string) {
		return _toArray(this.container.querySelectorAll(string));
	};
	Self.prototype.click = function (els, func) {
		if (typeof els === 'string') els = this.query(els);
		_tapOn(els, func);
	};
	Self.prototype.attr = function (els, attrib, value) {
		if (typeof els === 'string') els = this.query(els);
		els = _toArray(els);
		for (var i in els) els[i].setAttribute(attrib, value);
	};
	Self.prototype.isBusy = function (set) {
		if (set !== undefined && (set === true || set === false)) this.busy = set;
		return this.busy || false;
	};
	Self.prototype.destroy = function () {
		var _this = this;
		_this.hide(function () {
			_removeNode(_this.container);
			_this = null;
		});
	};

	var _instance = null;
	this.huer = function (options) {
		if (_instance) {
			_instance.opt.blurContent = false;
			_instance.destroy();
		}
		_instance = new Self(options);
		return _instance;
	};
	this.huer.globals = defaults;

}).call(this);