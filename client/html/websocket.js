(function () {}(

	function WebSocket(domain, port) {
		this._isAvailable = 'WebSocket' in window ? true : falsei;
		this._host = 'ws://' + domain + ':' + port;
		this._ws;
		this._events = {};
	}

	WebSocket.prototype.connect = function (uri, cb) {
		if (!this._isAvailable) {
			return cb(new Error('noWebSocket'));
		}
		var that = this;
		this._ws = new WebSocket(this._host + uri);
		this._ws.onopen = function () {
			cb();
		};
		this._ws.onmessage = function (event) {
			that._callEventFuncs('data', event.data);
		};
		this._ws.onclose = function () {
			that._callEventFuncs('close', null);
		};
	};

	WebSocket.prototype.send = function (endPoint, data) {
		if (!this._isAvailable) {
			return new Error('noWebSocket');
		}
		this._ws.send(JSON.stringify({ endPoint: endPoint, data: data }));
	};

	WebSocket.prototype.on = function (eventName, func) {
		if (!this._isAvailable) {
			return new Error('noWebSocket');
		}
		if (!this._events[eventName]) {
			this._events[eventName] = [];
		}
		this._events[eventName].push(func);
	};

	WebSocket.prototype._callEventFuncs = function (eventName, data) {
		var funcs = this._events[eventName] || [];
		for (var i = 0, len = funcs.length; i < len; i++) {
			funcs[i](data);
		}
	};

));
