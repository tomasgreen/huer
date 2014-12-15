var express = require('express');
var app = express();
var os = require('os');
var port = 8126;
app.use('/', express.static(__dirname + '/examples'));
app.listen(port);

var getServerAdress = function () {
	var ifaces = os.networkInterfaces();
	for (var dev in ifaces) {
		ifaces[dev].forEach(function (details) {
			if (details.family == 'IPv4' && dev.indexOf('lo') === -1) {
				console.log('server running on http://' + details.address + ':' + port);
			}
		});
	}
}
getServerAdress();