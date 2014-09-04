var async = require('async');
var gracenode = require('gracenode');
var logger = gracenode.log.create('socket-request-hook');
var hookMapper = require('./mapper');
var hookMapList = [];

module.exports.addHooks = function (hooks) {
	hookMapList.push(hookMapper.map(hooks));
	logger.verbose('request hook mapped and added to hook map list:', hookMapList);
};

module.exports.exec = function (req, request, response, methodFunc) {
	var hook = hookMapper.find(hookMapList, req);
	if (hook) {
		execHook(hook, req, request, response, methodFunc);
		return true;
	}
	return false;
};

function execHook(hookList, req, request, response, methodFunc) {
	var count = 0;
	var endPoint = req.endPoint;
	logger.verbose('request hook found for (endPoint:' + endPoint + ')');
	async.eachSeries(hookList, function (hook, next) {
		hook(request, function (error, status) {
			count += 1;
			if (error) {
				logger.error('request hook #' + count + ' executed with an error (endPoint:' + endPoint + '):', '(connection-id:' + req.id + ')', '(status: ' + status + ')');
				return response.error(error.message, error.message, status);
			}
			logger.verbose('request hook #' + count + ' successfully executed (endPoint:' + endPoint + ')', '(connection-id:' + req.id + ')');
			next();
		});
	},
	function () {
		methodFunc(request, response);
	});
}
