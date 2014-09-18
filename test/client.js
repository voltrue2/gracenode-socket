var net = require('net');
var host = '127.0.0.1';
var port = 6000;

function Client() {
	this.callbacks = [];
	this.client;
}

Client.prototype.setup = function (cb) {

	this.client = new net.Socket();
	var that =  this;

	this.client.on('data', function (data) {
		that.callback(null, data);
	});

	this.client.on('close', function () {
		that.callback(new Error('closed'), null);
	});

	this.client.on('error', function (data) {
		that.callback(data, null);
	});
	this.client.connect(port, host, cb);

};

Client.prototype.once = function (cb) {
	this.callbacks.push(cb);
};

Client.prototype.send = function (endPoint, data, cb) {
	if (typeof cb === 'function') {
		this.callbacks.push(cb);
	}
	this.client.write(JSON.stringify({ endPoint: endPoint, data: { time: Date.now(), input: data || null } }));
};

Client.prototype.callback = function (error, res) {
	if (this.callbacks.length) {
		var cb = this.callbacks.shift();
		cb(error, res !== null ? JSON.parse(res.toString()) : null);
	}
};

module.exports = Client;
