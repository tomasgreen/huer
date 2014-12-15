var _isTouchDevice = 'ontouchstart' in document.documentElement;
var entityMap = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': '&quot;',
	"'": '&#39;',
	"/": '&#x2F;'
};

function escapeHtml(string) {
	return String(string).replace(/[&<>"'\/]/g, function (s) {
		return entityMap[s];
	});
}

function addEvent(el, events, func, useCapture) {
	if (useCapture === undefined) useCapture = false;
	var arr = events.split(' ');
	for (var i in arr) {
		el.addEventListener(arr[i], func, useCapture);
	}
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

function demo1() {
	_tapOn(document.getElementById('demo1'), function () {
		var html = '<h3>Huer</h3>';
		html += '<p>Huer is an configurable modal view that can be used as an alert replacement.</p><br>';
		html += '<button tabindex="2" data-destroy="click" class="btn" >Weird..</button>';
		html += '<button tabindex="1" data-destroy="click" class="btn btn-green" >Nice!</button>';
		huer(html);
	});
}

function example1() {
	var example = '';
	example += "var html = '<h3>New item</h3>';";
	example += "\nhtml += '<p>You have a new item in your inbox.</p><br>';";
	example += "\nhtml += '<button tabindex=\"1\" data-destroy=\"click\" class=\"btn\" >Ok</button>';";
	example += "\nhuer(html);";
	document.getElementById('example1').innerHTML = escapeHtml(example);
	_tapOn(document.getElementById('test1'), function () {
		var html = '<h3>New item</h3>';
		html += '<p>You have a new item in your inbox.</p><br>';
		html += '<button tabindex="1" data-destroy="click" class="btn" >Ok</button>';
		huer(html);
	});
}

function example2() {
	var example = '';
	example = "var html = '<h3>Delete item?</h3>';";
	example += "\nhtml += '<p>Do you want to delete this item?</p><br>';";
	example += "\nhtml += '<button tabindex=\"1\" data-destroy=\"click\" class=\"btn\">Cancel</button>';";
	example += "\nhtml += '<button tabindex=\"2\" data-button=\"delete\" class=\"btn btn-red\">Delete</button>';";
	example += "\nvar instance = huer(html);";
	example += "\ninstance.click('[data-button=\"delete\"]', function () {";
	example += "\n    instance.attr('button', 'disabled', true);";
	example += "\n    instance.getHtml().getElementsByTagName('p')[0].innerHTML = '<img height=\"20\" src=\"static/bubbles_black.svg\"/>';";
	example += "\n    setTimeout(function () {";
	example += "\n        instance.destroy();";
	example += "\n    }, 2000);";
	example += "\n});";
	document.getElementById('example2').innerHTML = escapeHtml(example);

	_tapOn(document.getElementById('test2'), function () {
		var html = '<h3>Delete item?</h3>';
		html += '<p>Do you want to delete this item?</p><br>';
		html += '<button tabindex=\"1\" data-destroy=\"click\" class=\"btn\">Cancel</button>';
		html += '<button tabindex=\"2\" data-button=\"delete\" class=\"btn btn-red\">Delete</button>';
		var instance = huer(html);
		instance.click('[data-button="delete"]', function () {
			instance.attr('button', 'disabled', true);
			instance.query('p')[0].innerHTML = '<img height=\"30\" src=\"static/bubbles_black.svg\"/>';
			setTimeout(function () {
				instance.destroy();
			}, 2000);
		});
	});
}

function example3() {
	var example = '';
	example = "var html = '<h3>Unsaved changes</h3> ';";
	example += "\nhtml += '<p>Do you want to save the changes made to this item?</p><br>';";
	example += "\nhtml += '<button tabindex=\"2\" data-destroy=\"click\" class=\"btn\">Cancel</button> ';";
	example += "\nhtml += '<button tabindex=\"3\" data-destroy=\"click\" class=\"btn btn-red\">Discard</button>';";
	example += "\nhtml += '<button tabindex=\"1\" data-destroy=\"click\" class=\"btn btn-green\">Save</button>';";
	example += "\nhuer(html);";
	document.getElementById('example3').innerHTML = escapeHtml(example);
	_tapOn(document.getElementById('test3'), function () {
		var html = '<h3>Unsaved changes</h3>';
		html += '<p>Do you want to save the changes made to this item?</p><br>';
		html += '<button tabindex="2" data-destroy="click" class="btn">Cancel</button>';
		html += '<button tabindex="3" data-destroy="click" class="btn btn-red">Discard</button>';
		html += '<button tabindex="1" data-destroy="click" class="btn btn-green">Save</button>';
		huer(html);
	});
}
document.addEventListener('DOMContentLoaded', function () {
	hljs.initHighlightingOnLoad();
	demo1();
	example1();
	example2();
	example3();
});