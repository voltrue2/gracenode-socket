var gn = require('gracenode');
var logger = gn.log.create('controller/test/index');

module.exports = function (req, res) {
	logger.verbose('request', req);
	res.respond({ test: true, time: Date.now() });
};
