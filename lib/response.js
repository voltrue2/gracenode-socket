var gn = require('gracenode');
var logger = gn.log.create('socket-response');
var hook = require('../hooks/response');

function Response(sock, parsed, request) {
	this._sock = sock;
	this._parsed = parsed;
	this._request = request;
}

Response.prototype.respond = function (data, status) {
	var that = this;
	hook.exec(this, function () {
		status = status || 200;
		that._sock.write(createResponseData(data, status));
	});
};

Response.prototype.error = function (code, message, status) {
	status = status || 400;
	logger.error('respond with an error:', code, message, '(status:' + status + ')');
	this._sock.write(createResponseData({ code: code, message: message }, status));
};

module.exports = Response;

function createResponseData(data, status) {
	var res = {
		data: data,
		status: status
	};
	try {
		return JSON.stringify(res);
	} catch (e) {
		logger.error('failed to create response data of', res, e);
		return null;
	}
}
