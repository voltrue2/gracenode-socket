var async = require('async');
var gracenode = require('gracenode');
var logger = gracenode.log.create('socket-response-hook');
var hookMapper = require('./mapper');
var hookMapList = [];

module.exports.addHooks = function (hooks) {
	hookMapList.push(hookMapper.map(hooks));
	logger.verbose('response hook mapped and added to hook map list:', hookMapList);
};

module.exports.exec = function (response, cb) {
	if (!response._parsed) {
		// if there is no request object, we don't even bother applying hooks
		return cb();
	}
	var hook = hookMapper.find(hookMapList, response._parsed.request);
	if (hook) {
		return execHook(hook, response._parsed.request, response._request, response, cb);
	}
	cb();
};

function execHook(hookList, req, request, response, cb) {
	var count = 0;
	var endPoint = req.endPoint;
	logger.verbose('response hook found for (endPoint:' + endPoint + ')');
	async.eachSeries(hookList, function (hook, next) {
		count += 1;
		hook(request, function (error, status) {
			if (error) {
				status = status || 400;
				logger.error('response hook #' + count + ' executed with an error (endPoint:' + endPoint + '):', '(connection-id:' + req.id + ')', '(status:' + status + ')');
				return response.error(error.message, error.message, status);	
			}
			logger.verbose('response hook #' + count + ' successfully executed (endPoint:' + endPoint + ')', '(connection-id:' + req.id + ')');
			next();
		});
	}, cb);
}
