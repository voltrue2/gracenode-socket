var EventEmitter = require('events').EventEmitter;
var net = require('net');
var uuid = require('node-uuid');
var gn = require('gracenode');
var logger = gn.log.create('socket-server');
var router = require('./router');
var controller = require('./controller');
var config = null;
var server = null;

module.exports = new EventEmitter();

module.exports.readConfig = function (configIn) {
	if (!configIn.host || !configIn.port) {
		throw new Error('invalid configurations given:\n' + JSON.stringify(configIn, null, 4));
	}
	config = configIn;
	gn.registerShutdownTask('socket-server', function (done) {
		try {
			logger.info('stopping socket server');
			server.close();
			logger.info('socket server stopped gracefully:', config.host + ':' + config.port);
		} catch (e) {
			logger.error(e);
		}
		done();
	});
};

module.exports.start = function () {
	logger.info('starting TCP socket server with at', config.host + ':' + config.port);
	server = net.createServer(onConnect);
	server.listen(config.port, config.host);
};

function onConnect(sock) {
	var id = uuid.v4();
	var idLog = '(connection-id:' + id + ')';
	logger.info('TCP socket connection opened at', sock.remoteAddress + ':' + sock.remotePort, idLog);
	var onData = function (binData) {
		var data = binData.toString();
		logger.info('data received:', data, idLog);
		var routed = router.handle(id, data);
		if (routed) {
			controller.exec(sock, routed);
		}
	};
	var onError = function (data) {
		logger.error('socket error:', data.toString(), idLog);
	};
	var onClose = function () {
		logger.info('connection closed:', idLog);
	};
	sock.on('data', onData);
	sock.on('error', onError);
	sock.on('close', onClose);
}
