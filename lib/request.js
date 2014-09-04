var gn = require('gracenode');
var logger = gn.log.create('socket-request');

function Request(parsed) {
	this._parsed = parsed;
	this._state = {};
	this.paramters = this._parsed.request.params;
}

Request.prototype.data = function (key) {
	if (this._parsed.data[key] !== undefined) {
		return gn.lib.cloneObj(this._parsed.data[key]);
	}
	return null;
};

Request.prototype.set = function (key, value) {
	this._state[key] = value;
};

Request.prototype.get = function (key) {
	if (this._state[key] !== undefined) {
		return gn.lib.cloneObj(this._state[key]);
	}
	return null;
};

module.exports = Request;
