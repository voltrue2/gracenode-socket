module.exports = function (req, res) {
	res.respond(req.data('input').test);
};
