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
			gn.socket.addRequestHook({
				test: {
					fail: function (req, cb) {
						cb(new Error('requestHookFailed'), 403);
					}
				}
			});
			gn.socket.addResponseHook({
				test: [
					function (req, cb) {
						cb();
					}
				]
			});
			gn.socket.addResponseHook({
				test: {
					resFail: function (req, cb) {
						cb(new Error('responseHookFailed'));
					}
				}
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

	it('Can send packet to the endPoint "/" and rerouted to "/test/"', function (done) {
		client.setup(function (error, sock) {
			assert.equal(error, null);
			clientSocket = sock;
			client.send(clientSocket, '/', { test: '#1' }, function (error, res) {
				assert.equal(error, null);
				assert.equal(res.data.test, true);
				assert.equal(res.status, 200);
				done();
			});
		});
	});

	it('Can reroute to another controller method', function (done) {
		client.send(clientSocket, '/reroute/from', { test: 'test' }, function (error, res) {
			assert.equal(error, null);
			assert.equal(res.data, 'test');
			done();
		});
	});

	it('Can fail request hook "/test/fail" with status 403', function (done) {
		client.send(clientSocket, '/test/fail', null, function (error, res) {
			assert.equal(res.data.code, 'requestHookFailed');
			assert.equal(res.status, 403);
			done();
		});
	});

	it('Can fail response hook "/test/resFail" with status 400', function (done) {
		client.send(clientSocket, '/test/resFail', null, function (error, res) {
			assert.equal(res.data.code, 'responseHookFailed');
			assert.equal(res.status, 400);
			done();
		});
	});
});
