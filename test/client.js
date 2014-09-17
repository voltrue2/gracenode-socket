var net = require('net');
var host = '127.0.0.1';
var port = 6000;
var callbacks = [];

exports.setup = function (cb) {

	var client = new net.Socket();

	client.on('data', function (data) {
		callback(null, data);
	});

	client.on('close', function () {
		callback(new Error('closed'), null);
	});

	client.on('error', function (data) {
		callback(data, null);
	});
	client.connect(port, host, function () {
		var call = function () {
			cb(null, client);
		};
		call();
	});

};

exports.send = function (client, endPoint, data, cb) {
	callbacks.push(cb);
	client.write(JSON.stringify({ endPoint: endPoint, data: { time: Date.now(), input: data || null } }));
};

function callback(error, res) {
	while (callbacks.length) {
		var cb = callbacks.shift();
		cb(error, res !== null ? JSON.parse(res.toString()) : null);
	}
}
