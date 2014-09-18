var gn = require('gracenode');
var logger = gn.log.create('socket');
var server = require('./lib/server');
var router = require('./lib/router');
var controller = require('./lib/controller');
var reqHook = require('./hooks/request');
var resHook = require('./hooks/response');
var async = require('async');

module.exports.readConfig = function (config) {
	if (!config) {
		throw new Error('invalid configurations:\n' + config); 
	}
	server.readConfig(config);
	router.readConfig(config);
	controller.readConfig(config.controllerPath);
};

module.exports.setup = function (cb) {
	async.series([
		router.setup,
		server.setup
	], cb);
};

module.exports.addRequestHook = function (hooks) {
	logger.verbose('add request hooks:', hooks);
	reqHook.addHooks(hooks);
};

module.exports.addResponseHook = function (hooks) {
	logger.verbose('add response hooks:', hooks);
	resHook.addHooks(hooks);
};

module.exports.start = function () {
	server.start();
};

module.exports.getConnectionsByIds = function (idList) {
	return server.getConnectionsByIds(idList);
};
