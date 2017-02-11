/**!
 * # huer
 * Author: Tomas Green (http://www.github.com/tomasgreen)
 * License: MIT
 * Version: 0.1.1
 */

(function () {
	'use strict';
	var _animationEndEvents = 'webkitAnimationEnd mozAnimationEnd msAnimationEnd oAnimationEnd animationend',
		_animationStartEvents = 'webkitAnimationStart mozAnimationStart msAnimationStart oAnimationStart animationstart',
		_isTouchDevice = 'ontouchstart' in document.documentElement,
		_scrollbarWidth,
		_classPrefix = 'huer-',
		_classFadeIn = _classPrefix + 'fade-in',
		_classFadeOut = _classPrefix + 'fade-out',
		_classBounceIn = _classPrefix + 'bounce-in',
		_classZoomOut = _classPrefix + 'zoom-out',
		_classStopScroll = _classPrefix + 'stop-scrolling',
		_classContainer = _classPrefix + 'container',
		_classContainerCenter = _classPrefix + 'container-center',
		_classContainerCenterForced = _classPrefix + 'container-center-forced',
		_classBody = _classPrefix + 'body',
		_classContentWrapper = _classPrefix + 'content-wrapper',
		_classModal = _classPrefix + 'modal',
		_tabindexAttr = 'tabindex';

	function _removeNode(element) {
		if (!element || !element.parentNode) return;
		element.parentNode.removeChild(element);
		return undefined;
	}

	function _detectCSSFeature(featurename) {
		var feature = false,
			domPrefixes = 'Webkit Moz ms O'.split(' '),
			el = document.createElement('div'),
			featurenameCapital = null;

		featurename = featurename.toLowerCase();
		if (el.style[featurename] !== undefined) feature = true;
		if (feature === false) {
			featurenameCapital = featurename.charAt(0).toUpperCase() + featurename.substr(1);
			for (var i = 0; i < domPrefixes.length; i++) {
				if (el.style[domPrefixes[i] + featurenameCapital] !== undefined) {
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

	function _toInt(n) {
		return parseInt(n, 10);
	}

	function _createElement(type, attrib, parent, html) {
		var el, cls, id, arr;
		if (!attrib) attrib = {};
		if (type.indexOf('.') !== -1) {
			arr = type.split('.');
			type = arr[0];
			arr.shift();
			attrib.class = arr.join(' ');
		}
		if (type.indexOf('#') !== -1) {
			arr = type.split('#');
			type = arr[0];
			attrib.id = arr[1];
		}
		el = document.createElement(type);
		for (var i in attrib) el.setAttribute(i, attrib[i]);
		if (parent) parent.appendChild(el);
		if (html) el.innerHTML = html;
		return el;
	}

	function _isChild(c, p) {
		if (!c || !p || !c.parentNode) return false;
		else if (c === p || c.parentNode === p) return true;
		return _isChild(c.parentNode, p);
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
		_on(el, 'click', func);
	}

	function _tapOff(el, func) {
		_off(el, 'click', func);
	}

	function _each(o, func) {
		if (!o || (o.length === 0 && o != window)) return;
		if (!o.length) func(o);
		else Array.prototype.forEach.call(o, function (el, i) {
			func(el);
		});
	}

	function _one(el, events, func, useCapture) {
		var fnc = function (ev) {
			_off(el, events, fnc, useCapture);
			func(ev);
		}
		_on(el, events, fnc, useCapture);
	}

	function _on(els, events, func, useCapture) {
		if (useCapture === undefined) useCapture = false
		_each(els, function (el) {
			var ev = events.split(' ');
			for (var e in ev) el.addEventListener(ev[e], func, useCapture);
		});
	}

	function _off(els, events, func, useCapture) {
		if (useCapture === undefined) useCapture = false
		_each(els, function (el) {
			var ev = events.split(' ');
			for (var e in ev) el.removeEventListener(ev[e], func, useCapture);
		});
	}

	function _isChild(c, p) {
		if (!c || !p || !c.parentNode) return false;
		else if (c === p || c.parentNode === p) return true;
		return _isChild(c.parentNode, p);
	}

	function _addClass(els, cls) {
		_each(els, function (el) {
			if (el.classList) {
				var arr = cls.split(' ');
				for (var i in arr) el.classList.add(arr[i]);
			} else el.className += ' ' + cls;
		});
	}

	function _removeClass(els, cls) {
		_each(els, function (el) {
			if (el.classList) {
				var arr = cls.split(' ');
				for (var i in arr) el.classList.remove(arr[i]);
			} else el.className = el.className.replace(new RegExp('(^|\\b)' + cls.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		});
	}

	function _animateCSS(el, cls, start, end) {
		if (start) _one(el, _animationStartEvents, start);
		_one(el, _animationStartEvents, function (ev) {
			_removeClass(el, cls);
			if (end) end(ev);
		});
		_addClass(el, cls);
	}

	function _attr(els, attrib, value) {
		_each(els, function (el) {
			el.setAttribute(attrib, value);
		});
	};

	function _isObject(obj) {
		return obj === Object(obj);
	}

	function _isString(obj) {
		return (typeof obj === 'string');
	}

	function _getScrollbarWidth() {
		if (_scrollbarWidth > 0) return _scrollbarWidth;
		var doc = document.body || document.documentElement
		var el = _createElement('div.huer-scrollbar-measure', null, doc);
		_scrollbarWidth = el.offsetWidth - el.clientWidth
		_removeNode(el);
		return _scrollbarWidth;
	}
	var defaults = {
		html: 'Empty',
		showOnInit: true,
		useEffects: true,
		preventScroll: true,
		destroyOnClick: false,
		destroyOnEsc: false,
		onFeatureFail: null,
		onDismiss: null,
		overlayClass: null,
		bodyClass: null,
		contentClass: null,
		forceCenter: false,
		modal: false
	};
	var Huer = function () {
		var options;
		var _this = this;
		if (_isObject(arguments[0])) {
			options = arguments[0];
		} else if (arguments[0]) {
			options = {
				html: arguments[0]
			};
		}
		_this.element = document.body || document.documentElement
		_this.opt = {};
		_this.vars = {};
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
		if (!featureSupport.animation || !featureSupport.transition || !featureSupport.transform) _this.opt.useEffects = false;
		if (!featureSupport.query) {
			if (_this.opt.onFeatureFail) _this.opt.onFeatureFail(featureSupport);
			else alert('Your browser is lacking certain features. Please update to a modern browser.');
			return;
		}

		var container = _createElement('div.' + _classContainer);
		var body = _createElement('div.' + _classBody, null, container);
		if (_this.opt.bodyClass) _addClass(body, _this.opt.bodyClass);
		if (_this.opt.modal) _addClass(body, _classModal)
		var wrapperEl = _createElement('div.' + _classContentWrapper, null, body);
		if (_this.opt.contentClass) _addClass(t, _this.opt.contentClass);

		if (_isString(_this.opt.html)) wrapperEl.innerHTML = _this.opt.html
		else wrapperEl.appendChild(_this.opt.html);
		_this.container = container;
		_this.body = body;
		_this.element.appendChild(_this.container);

		if (_this.opt.showOnInit) _this.show();

		_this.click('[data-destroy="click"]', function () {
			if (!_this.isBusy()) _this.destroy(_this.opt.onDismiss);
		});
		if(_this.opt.forceCenter) {
			_addClass(_this.container, _classContainerCenterForced)
		} else {
			_on(window, 'resize', _this.windowResize.bind(_this))
			_this.windowResize()
		}
	};
	var proto = Huer.prototype;
	proto.windowResize = function () {
		if (this.body.offsetHeight > window.innerHeight) _removeClass(this.container, _classContainerCenter)
		else _addClass(this.container, _classContainerCenter)
	}
	proto.show = function (callback) {
		var _this = this;
		if (_this.isVisible) return;

		_this.container.style.visibility = 'visible';

		_this.toggleEffects(callback);
		_on(window, 'keydown', _this.vars.onKeydownEvent = _this.onKeydown.bind(_this));
		_this.focusElement(true);
	};
	proto.hide = function (callback) {
		/*if (!this.isVisible) return;*/

		_off(window, 'keydown', this.vars.onKeydownEvent);

		this.toggleEffects(callback);
	};
	proto.destroy = function (callback) {
		var _this = this;
		_this.hide(function () {
			if (callback) callback();
			else if (_this.opt.onDismiss) _this.opt.onDismiss();
			_removeNode(_this.container);
			_instance = null;
		});
		_off(window, 'resize', _this.windowResize)
	};
	proto.toggleScroll = function (enable) {
		var _this = this
		if (!_this.opt.preventScroll) return;
		if (enable) {
			_removeClass(_this.element, _classStopScroll);
			_this.element.style.paddingRight = _this.vars.bodyPadding;
			_this.element.style.top = "";
			window.scrollTo(0, _this.vars.scrollOffset);
			_this.vars.scrollOffset = null;
		} else {
			var top = _this.element.scrollTop || document.documentElement.scrollTop
			_this.vars.scrollOffset = top
			_this.element.style.top = (top * -1) + "px"
			_this.vars.bodyPadding = _this.element.style.paddingRight;
			_this.element.style.paddingRight = _toInt(_this.vars.bodyPadding) + _toInt(_getScrollbarWidth()) + 'px';
			_addClass(_this.element, _classStopScroll);
		}
	};
	proto.toggleEffects = function (callback) {
		var _this = this;
		if (!_this.opt.useEffects) {
			_this.toggleScroll(_this.isVisible);
			_this.isVisible = true;
			if (callback) callback();
			return;
		}
		if (_this.isVisible) {
			_one(_this.body, _animationEndEvents, function () {
				_removeClass(_this.container, _classFadeOut);
				_removeClass(_this.body, _classZoomOut);
				_this.container.style.visibility = 'hidden';
				/*
					toggleScroll needs to be called after the animations are done,
					if not the effects will lag
				*/
				_this.toggleScroll(true);
				_this.isVisible = false;

				if (callback) callback();
			});

			_addClass(_this.container, _classFadeOut);
			_addClass(_this.body, _classZoomOut);
			_this.toggleOverlayClick();
		} else {
			_one(_this.body, _animationEndEvents, function () {
				_removeClass(_this.container, _classFadeIn);
				_removeClass(_this.body, _classBounceIn);
				_this.isVisible = true;
				_this.toggleOverlayClick();
				if (callback) callback();
			});

			_this.toggleScroll(false);

			_addClass(_this.container, _classFadeIn);
			_addClass(_this.body, _classBounceIn);
		}
	};
	proto.onOverlayClick = function (ev) {
		if (this.isVisible && this.opt.destroyOnClick && !this.isBusy() & !_isChild(ev.target, this.body)) this.destroy();
	};
	proto.toggleOverlayClick = function () {
		var _this = this;
		/*
			Somethings up with the timeing of the effects and when a user doubleclicks the clickevent bubbles up and ruins everything...
		*/
		setTimeout(function () {
			if (!_this.vars.onOverlayClickEvent) {
				_tapOn(_this.container, _this.vars.onOverlayClickEvent = _this.onOverlayClick.bind(_this));
			} else {
				_tapOff(_this.container, _this.vars.onOverlayClickEvent);
				_this.vars.onOverlayClickEvent = null;
			}
		}, 0);
	};
	proto.onKeydown = function (e) {
		var keyCode = e.keyCode || e.which;
		var el = e.target || e.srcElement;
		if ([9, 13, 32, 27].indexOf(keyCode) === -1) {
			if (!_isChild(el, this.body)) return;
		} else if (keyCode === 27 && this.opt.destroyOnEsc && !this.isBusy()) {
			this.destroy();
		} else if (keyCode === 9) {
			_stopEventPropagation(e);
			this.focusElement();
		}
		return true;
	};
	proto.focusElement = function (reset) {
		if (reset) this.lastTabindex = null;
		var els = this.query('[' + _tabindexAttr + ']');
		if (!els.length) {
			this.container.focus();
			return;
		}
		els = _toArray(els);
		els.sort(function (a, b) {
			if (!a.getAttribute || !b.getAttribute) return -1;
			return _toInt(a.getAttribute(_tabindexAttr)) - _toInt(b.getAttribute(_tabindexAttr));
		});
		if (this.lastTabindex) {
			for (var e = 0; e < els.length; e++) {
				if (els[e].getAttribute(_tabindexAttr) == this.lastTabindex && e < els.length - 1) {
					els[e + 1].focus();
					this.lastTabindex = els[e + 1].getAttribute(_tabindexAttr);
					return;
				}
			}
		}
		els[0].focus();
		this.lastTabindex = els[0].getAttribute(_tabindexAttr);
	};
	proto.getHtml = function () {
		return this.container;
	};
	proto.query = function (string) {
		return _toArray(this.container.querySelectorAll(string));
	};
	proto.click = function (els, func) {
		if (_isString(els)) els = this.query(els);
		_tapOn(els, func);
	};
	proto.attr = function (els, attrib, value) {
		if (_isString(els)) els = this.query(els);
		_attr(_toArray(els), attrib, value);
	};
	proto.isBusy = function (set) {
		if (set !== undefined && (set === true || set === false)) this.busy = set;
		return this.busy || false;
	};

	var _instance = null;
	this.huer = function (options) {
		if (_instance) _instance.destroy();
		_instance = new Huer(options);
		return _instance;
	};
	this.huer.globals = defaults;
	/*this.huer.setGlobal = function () {
		if (_isObject(arguments[0])) {
			var obj = arguments[0];
			for (var i in obj) {
				if (defaults[i] !== undefined) defaults[i] = obj[i];
			}
		} else if (arguments[0] && arguments[1]) {
			var key = arguments[0],
				val = arguments[1];
			if (defaults[key] !== undefined) defaults[key] = val;
		}
	}*/
}).call(this);
(function () {
	'use strict';
	var Modal = function () {
		huer({
			html: html,
			destroyOnEsc: true,
			destroyOnClick: true,
			wrapContent: false,
			bodyClass: 'modal',
			modal: true,
		});
	}

}).call(this);