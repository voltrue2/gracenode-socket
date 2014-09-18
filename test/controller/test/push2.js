var gn = require('gracenode');
var list = [];

module.exports = function (req, res) {
	if (list.indexOf(req.getConnectionId()) === -1) {
		// register the connection
		list.push(req.getConnectionId());
	}

	// now we have more than one client connected
	if (list.length > 1) {
		setTimeout(function () {
			var responses = gn.socket.getConnectionsByIds(list);
			for (var i = 0, len = responses.length; i < len; i++) {
				responses[i].respond('push', 200);
			}
		}, 100);
	}
};
