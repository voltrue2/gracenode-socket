var gn = require('gracenode');
var logger = gn.log.create('socket-controller');
var Request = require('./request');
var Response = require('./response');
var hook = require('../hooks/request');
var controllerPath;

module.exports.readConfig = function (controllerPathIn) {
	// this gets called after all configuration checks in index.js
	controllerPath = controllerPathIn;
};

module.exports.exec = function (sock, parsed) {
	var request = new Request(parsed);
	var response = new Response(sock, parsed, request);
	if (parsed.error) {
		return errorHandler(parsed, request, response);
	}
	handle(parsed.request, request, response);
};

function handle(req, request, response) {
	var path = gn.getRootPath() + controllerPath + req.controller + '/' + req.method;
	var method = require(path);
	// check for request hook
	var hooked = hook.exec(req, request, response, method);
	if (hooked) {
		return;
	}
	// execute controller method
	logger.verbose('execute controller:', path, '(connection-id:' + req.id + ')');
	method(request, response);
}

function errorHandler(parsed, request, response) {
	// TODO: implement error handling the same as gracenode-server
	response.error(parsed.error.code, parsed.error.message, parsed.error.status);
}
