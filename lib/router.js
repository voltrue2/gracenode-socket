var gn = require('gracenode');
var logger = gn.log.create('socket-router');
var controllerPath;
var reroutes = {};
var controllers = {};

module.exports.readConfig = function (config) {
	if (!config.controllerPath) {
		throw new Error('invalid configurations given:\n' + JSON.stringify(config, null, 4));
	}
	controllerPath = config.controllerPath;
	setupReroutes(config.reroute);
};

module.exports.setup = function (cb) {
	setupControllers(cb);
};

// data must be a JSON
/* format
data: {
	"endPoint": "/controllerName/methodName/",
	"data": mixed
}
*/
module.exports.handle = function (id, data) {
	var json = jsonParse(data);
	logger.verbose('parsed data:', json);
	if (!json) {
		return null;
	}
	var parsed = parse(id, json);
	var request = parsed.request;
	// check for the contorller's method
	if (!request.method) {
		// if there is no method, gracenode-socket will look for index.js
		request.method = 'index';
	}
	// check for endPoint
	if (!parsed.request.endPoint) {
		parsed.error = {
			message: 'invalid endPoint given',
			code: 'invalidEndPoint',
			status: 400 // just like HTTP
		};
	}
	if (!parsed.error) {
		// check for the controller and its method
		if (!controllers[parsed.request.controller]) {
			parsed.error = {
				message: 'controller ' + parsed.request.controller + ' not found',
				code: 'notFound',
				status: 404 // just like HTTP
			};
		} else if (!controllers[parsed.request.controller][parsed.request.method]) {
			parsed.error = {
				message: 'controller method ' + parsed.request.controller + '/' + parsed.request.method + ' not found',
				code: 'notFound',
				status: 404 // just like HTTP
			};
		}
	}
	logger.verbose('request resolved:', parsed);
	return parsed;
};

function jsonParse(data) {
	try {
		return JSON.parse(data);
	} catch (e) {
		logger.error(e);
		return null;
	}
}

function setupControllers(cb) {
	var path = gn.getRootPath() + controllerPath;
	gn.lib.walkDir(path, function (error, list) {
		if (error) {
			return cb(error);
		}
		for (var i = 0, len = list.length; i < len; i++) {
			var item = list[i];
			var splits = item.file.replace(path, '').split('/');
			if (splits[0] && splits[1]) {
				var controller = splits[0];
				var method = splits[1].substring(0, splits[1].lastIndexOf('.'));
				if (!controllers[controller]) {
					controllers[controller] = {};
				}
				controllers[controller][method] = true;
			}
		}
		if (!Object.keys(controllers).length) {
			logger.warn('there are no controllers in', path);
		}
		logger.verbose('controllers and methods mapped:', controllers);
		cb();
	});
}

/*
"reroutes": [
	{ "from": "", "to": "" },
	{...}
]
*/
function setupReroutes(reroutesIn) {
	if (reroutesIn) {
		for (var i = 0, len = reroutesIn.length; i < len; i++) {
			reroutes[reroutesIn[i].from] = reroutesIn[i].to;
		}	
	}
}

function parse(id, json) {
	var endPoint = parseEndPoint(id, json.endPoint);
	var data = json.data || {};
	return {
		request: endPoint,
		data: data
	};
}

function parseEndPoint(id, endPoint) {
	endPoint = endPoint || '';
	var res = {
		id: id,
		endPoint: endPoint,
		controller: null,
		method: null,
		params: []
	};
	if (endPoint === '/') {
		if (reroutes[endPoint]) {
			// there is a reroute
			return parseEndPoint(reroutes[endPoint]);
		}
		return res;
	}
	var splits = endPoint.split('/');
	for (var i = 0, len = splits.length; i < len; i++) {
		if (splits[i] && !res.controller) {
			res.controller = splits[i];
			continue;
		}
		if (splits[i] && !res.method) {
			res.method = splits[i];
			continue;
		}
		if (splits[i]) {
			res.params.push(splits[i]);
		}
	}
	return res;
}
