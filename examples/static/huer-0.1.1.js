/**!
 * # huer
 * Author: Tomas Green (http://www.github.com/tomasgreen)
 * License: MIT
 * Version: 0.1.0
 */
(function () {
	'use strict';
	var _animationEndEvents = 'webkitAnimationEnd mozAnimationEnd msAnimationEnd oAnimationEnd animationend',
		_animationStartEvents = 'webkitAnimationStart mozAnimationStart msAnimationStart oAnimationStart animationstart',
		_isTouchDevice = 'ontouchstart' in document.documentElement;

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

	function _each(o, func) {
		if (!o || (o.length === 0 && o != window)) return;
		if (!o.length) func(o);
		else Array.prototype.forEach.call(o, function (el, i) {
			func(el);
		});
	}

	function _one(el, events, func, useCapture) {
		_on(el, events, function (ev) {
			func(ev);
			_off(el, events, func);
		}, useCapture);
	}

	function _on(els, events, func, useCapture) {
		_each(els, function (el) {
			var ev = events.split(' ');
			for (var e in ev) el.addEventListener(ev[e], func, useCapture);
		});
	}

	function _off(els, events, func) {
		_each(els, function (el) {
			var ev = events.split(' ');
			for (var e in ev) el.removeEventListener(ev[e], func);
		});
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
		_this.element = document.body;
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
		_this.vars.onOverlayClickEvent = _this.onOverlayClick.bind(_this);
		_this.click(_this.overlay, _this.vars.onOverlayClickEvent);
		if (_this.opt.showOnInit) {
			_this.show();
		}
	};
	Huer.prototype.blurContent = function () {
		var _this = this;
		if (!_this.opt.blurContent) return;
		var els = (_this.opt.blurAllSiblings) ? _this.container.parentNode.childNodes : document.querySelectorAll(_this.opt.blurSelector);
		for (var i = 0; i < els.length; i++) {
			if (els[i] == _this.container) continue;
			_addClass(els[i], 'huer-blur');
		}
	};
	Huer.prototype.focusContent = function () {
		var _this = this;
		if (!_this.opt.blurContent) return;
		var els = document.querySelectorAll('.huer-blur');

		_removeClass(els, 'huer-blur');
		_animateCSS(els, 'huer-focus');
	};
	Huer.prototype.toggleEffects = function (finishedCallback) {
		var _this = this;
		if (!_this.opt.useEffects) {
			if (finishedCallback) finishedCallback();
			return;
		}
		if (_this.isVisible) {
			var animationOutEnd = function () {
				_removeClass(_this.overlay, 'huer-fade-out');
				_removeClass(_this.body, 'huer-zoom-out');
				_this.container.style.display = 'none';
				if (finishedCallback) finishedCallback();
			};
			_one(_this.body, _animationEndEvents, animationOutEnd);

			_addClass(_this.overlay, 'huer-fade-out');
			_addClass(_this.body, 'huer-zoom-out');
			_this.focusContent();
		} else {
			var animationInEnd = function () {
				_removeClass(_this.overlay, 'huer-fade-in');
				_removeClass(_this.body, 'huer-bounce-in');
				if (finishedCallback) finishedCallback();
			};
			_one(_this.body, _animationEndEvents, animationInEnd);

			_addClass(_this.overlay, 'huer-fade-in');
			_addClass(_this.body, 'huer-bounce-in');
			_this.blurContent();
		}
	};
	Huer.prototype.show = function (callback) {
		var _this = this;
		if (_this.isVisible) return;

		_this.container.style.visibility = 'hidden';
		_this.container.style.display = 'block';

		if (_this.opt.centerize) _centerize(_this.body);

		_this.container.style.visibility = 'visible';

		_this.toggleEffects(callback);
		_this.vars.onWindowKeydownEvent = _this.onWindowKeydown.bind(_this);
		_on(window, 'keydown', _this.vars.onWindowKeydownEvent);
		_this.focusElement(true);
		_this.isVisible = true;
	};
	Huer.prototype.onOverlayClick = function () {
		if (this.opt.clickOutsideToDismiss && !this.isBusy()) this.destroy();
	};
	Huer.prototype.onWindowKeydown = function (e) {
		var keyCode = e.keyCode || e.which;
		if ([9, 13, 32, 27].indexOf(keyCode) === -1) {
			//_stopEventPropagation(e);
			return;
		}
		if (keyCode === 9) {
			//var el = e.target || e.srcElement;
			_stopEventPropagation(e);
			this.focusElement();
		}
	};
	Huer.prototype.focusElement = function (reset) {
		if (reset) this.lastTabindex = null;
		var els = this.query('[tabindex]');
		if (!els.length) {
			this.overlay.focus();
			return;
		}
		els = _toArray(els);
		els.sort(function (a, b) {
			if (!a.getAttribute || !b.getAttribute) return -1;
			return _toInt(a.getAttribute('tabindex')) - _toInt(b.getAttribute('tabindex'));
		});
		if (this.lastTabindex) {
			for (var e = 0; e < els.length; e++) {
				if (els[e].getAttribute('tabindex') == this.lastTabindex && e < els.length - 1) {
					els[e + 1].focus();
					this.lastTabindex = els[e + 1].getAttribute('tabindex');
					return;
				}
			}
		}
		els[0].focus();
		this.lastTabindex = els[0].getAttribute('tabindex');
	};
	Huer.prototype.hide = function (callback) {
		if (!this.isVisible) return;

		_off(window, 'keydown', this.vars.onWindowKeydownEvent);

		this.toggleEffects(callback);
		this.isVisible = false;
	};
	Huer.prototype.getHtml = function () {
		return this.container;
	};
	Huer.prototype.query = function (string) {
		return _toArray(this.container.querySelectorAll(string));
	};
	Huer.prototype.click = function (els, func) {
		if (_isString(els)) els = this.query(els);
		_tapOn(els, func);
	};
	Huer.prototype.attr = function (els, attrib, value) {
		if (_isString(els)) els = this.query(els);
		_attr(_toArray(els), attrib, value);
	};
	Huer.prototype.isBusy = function (set) {
		if (set !== undefined && (set === true || set === false)) this.busy = set;
		return this.busy || false;
	};
	Huer.prototype.destroy = function () {
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
		_instance = new Huer(options);
		return _instance;
	};
	this.huer.globals = defaults;

}).call(this);