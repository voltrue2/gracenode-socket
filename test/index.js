var prefix = require('./prefix');
var gn = require('gracenode');
var client = require('./client');
var assert = require('assert');
var clientSocket = null;

describe('gracenode-socket', function () {

	console.log('*** NOTICE: This test requires gracenode installed in the same directory as this module.');

	it('Can set up a socket server', function (done) {

		gn.setConfigPath(prefix + 'gracenode-socket/test/configs/');
		gn.setConfigFiles(['config.json']);

		gn.use('gracenode-socket');

		gn.on('setup.config', function () {
			var cpath = gn.config.getOne('modules.gracenode-socket.controllerPath');
			gn.config.set('modules.gracenode-socket.controllerPath', prefix + cpath);	
			var keyPath = gn.config.getOne('modules.gracenode-socket.key');
			var certPath = gn.config.getOne('modules.gracenode-socket.cert');
			gn.config.set('modules.gracenode-socket.key', prefix + keyPath);
			gn.config.set('modules.gracenode-socket.cert', prefix + certPath);
		});

		gn.setup(function () {
			gn.socket.addRequestHook({
				test: [
					function (req, cb) {
						cb();
					}
				]
			});
			gn.socket.addResponseHook({
				test: [
					function (req, cb) {
						cb();
					}
				]
			});
			gn.socket.start();

			done();
		});

	});

	it('Can send packet to the endPoint "/test/"', function (done) {
		client.setup(function (error, sock) {
			assert.equal(error, null);
			clientSocket = sock;
			client.send(clientSocket, '/test/', { test: '#1' }, function (error, res) {
				assert.equal(error, null);
				assert.equal(res.data.test, true);
				assert.equal(res.status, 200);
				done();
			});
		});
	});

});
