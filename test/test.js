var prefix = require('./prefix');
var gn = require('gracenode');
gn.setConfigPath(prefix + 'gracenode-socket/test/configs/');
gn.setConfigFiles(['test.json']);
gn.use('gracenode-socket');

gn.on('setup.config', function () {
	var cpath = gn.config.getOne('modules.gracenode-socket.controllerPath');
	gn.config.set('modules.gracenode-socket.controllerPath', prefix + cpath);
});

gn.setup(function () {
	gn.socket.start();
});

