module.exports = function (req, res) {
	// respond back
	res.respond({ res: 'wait for push' }, 200);
	// push data to the client
	setTimeout(function () {	
		res.respond('push', 200);
	}, 200);
};
