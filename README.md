# gracenode-socket

TCP socket server for gracenode framework.

***

## How to include it in your project

To add this package as your gracenode module, add the following to your package.json:

```
"dependencies": {
        "gracenode": "",
        "gracenode-socket": ""
}
```

To use this module in your application, add the following to your gracenode bootstrap code:

```
var gracenode = require('gracenode');
// this tells gracenode to load the module
gracenode.use('gracenode-socket');
```
A
To access the module:

```
// the prefix gracenode- will be removed automatically
gracenode.socket
```

## Configurations

```
"modules": {
    "gracenode-socket": {
	"tls": <boolean>,
	"key": <path to the key file for TLS>,
	"cert": <path to the cert file for TLS>,
	"requestCert": <boolean>,
	"ca": <an array of client certificate files>,
        "host": <IP address or host name>,
        "port": <port number>,
        "controllerPath": </path/to/your/controller/directory/>,
        "reroute": [
            { "from": "/from/here", "to": "/reroute/here" }
        ]
    }
}
```

### tls

If true, the server will be using TLS for encrypted communication.

The default value is `false`.

### key

A string value of the path to the key file for TLS.

If `tls` is `false`, this value is not required.

### cert

A string value of the path to the cert file for TLS.

If `tls` is `false`, this value is not required.

### requestCert

A boolean value if the client is using certificate authenticateion.

The default value is `false`.

### ca

An array of certificate files for the client that uses a self-signed certificate.

If the client(s) does not use self-signed  certificate, this value is not required.

### host

A string value of either an IP address or a host name for the TCP server.

### port

An integer value of the port number for the TCP server to listen to.

### controllerPath

A path to the directory that contains all of your controllers for the server.

Controllers will be explained below.

### reroute

An array of reroute definition objects to define rerouting.

Example:

If it is given `{ "from": "/reroute/me", "to": "/i/am/rerouted" }`, The pocket that contains `"/reroute/me/"` as the `endPoint`
will execute the controller method of `"/i/am/rerouted"` instead.

## Data Format

`gracenode-socket` module's server expects the client the send the data in a certain format.

The data **MUST** be a stringified JSON.

The structure of the JSON needs to be as show below:

```
{
	"endPoint": <string a value representing what controller and method to execte>,
	"data": <object a groupd of data sent from the client for the server>
}
```

## EndPoint

The `endPoint` in the JSON data sent from the client acts very similar to URI of HTTP/HTTPS.

It tells the server what `controller` and what `method` to execte.

Example:

If the server recieves the following data:

```
{
	"endPoint": "/example/one",
	"data": { test: true }
}
```

The `controller` that will be executed is `example` and the method will be `one`.

The gracenode-socket module expects the controller (mostly a directory) called `example` to be available under the `controllerPath`

For the `endPoint` example above, the script to be executed would be:

`/your/controller/path/example/one.js`

## Controller

The controller method script will have 2 arguments passed from the `gracenode-server` every time the server receives data from the client.

The script would look like the below:

```
exports = function (reqest, response) {
	// access the data sent from the client
	var someData = request.data('someData');
	// if the server needs to send some data back to the client
	response.respond(someResponse);
};
```
