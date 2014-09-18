var EventEmitter = require('events').EventEmitter;
var net = require('net');
var tls = require('tls');
var fs = require('fs');
var uuid = require('node-uuid');
var gn = require('gracenode');
var logger = gn.log.create('socket-server');
var router = require('./router');
var controller = require('./controller');
var Response = require('./response');
var async = require('async');
var config = null;
var server = null;
var tlsOptions = null;
var connections = {};

module.exports = new EventEmitter();

module.exports.readConfig = function (configIn) {
	if (!configIn.host || !configIn.port) {
		throw new Error('invalid configurations given:\n' + JSON.stringify(configIn, null, 4));
	}
	if (configIn.tls) {
		if (!configIn.key || !configIn.cert) {
			throw new Error('TLS requires both key and cert file defined in the configurations');
		}
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

module.exports.setup = function (cb) {
	if (config && config.tls) {
		tlsOptions = {};
		var readKey = function (next) {
			logger.info('using TLS: reading key file >', config.key);
			fs.readFile(config.key, 'utf8', function (error, data) {
				if (error) {
					return next(error);
				}
				tlsOptions.key = data;
				next();
			});
		};
		var readCert = function (next) {
			logger.info('using TLS: reading cert file >', config.cert);
			fs.readFile(config.cert, 'utf8', function (error, data) {
				if (error) {
					return next(error);
				}
				tlsOptions.cert = data;
				next();
			});
		};
		var readClientCerts = function (next) {
			if (!config.ca || !config.ca.length) {
				// client(s) is not using self-signed certificate
				return next();
			}
			async.eachSeries(config.ca, function (path, done) {
				logger.info('using TLS and the client is using a self-signed certificate:', path);
				fs.readFile(path, 'utf8', function (error, data) {
					if (error) {
						return done(error);
					}
					if (!tlsOptions.ca) {
						tlsOptions.ca = [];
					}
					tlsOptions.ca.push(data);
					done();
				});
			}, next);
		};
		var finish = function (next) {
			tlsOptions.requestCert = config.requestCert || false;
			logger.info('using TLS: request cert [' + tlsOptions.requestCert + ']');
			next();
		};
		async.series([
			readKey,
			readCert,
			readClientCerts,
			finish
		], cb);
		return;
	}
	cb();
};

module.exports.start = function () {
	logger.info('starting TCP socket server with at', config.host + ':' + config.port);
	if (config && config.tls) {
		logger.info('using TLS for encrypted communication');
		server = tls.createServer(tlsOptions, onConnect);
	} else {
		server = net.createServer(onConnect);
	}
	server.listen(config.port, config.host);
};

module.exports.getConnectionsByIds = function (idList) {
	var list = [];
	for (var i = 0, len = idList.length; i < len; i++) {
		if (connections[idList[i]]) {
			list.push(new Response(connections[idList[i]], null, null));
		}
	}
	return list;
};

function onConnect(sock) {
	if (config.tls) {
		sock.setEncoding('utf8');
		logger.info('connection authorized: [' + sock.authorized + ']');
	}
	var id = uuid.v4();
	var idLog = '(connection-id:' + id + ')';
	
	logger.info('TCP socket connection opened at', sock.remoteAddress + ':' + sock.remotePort, idLog);

	// register the new connection to connection map
	connections[id] = sock;

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
		delete connections[id];
		logger.info('connection closed:', idLog);
	};
	sock.on('data', onData);
	sock.on('error', onError);
	sock.on('close', onClose);
}
