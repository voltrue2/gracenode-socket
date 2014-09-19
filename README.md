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

To access the module:

```
// the prefix gracenode- will be removed automatically
gracenode.socket
```

***

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

***

## Methods

###.start()

Starts the socket server.

###.getConnectionsByIds(idList [array])

Returns an array of client connections to be used to push data from the server to other clients.

The returned connections are instances of `Response` object.

#### Example: 

The code below will push data from the server to multiple clients

```
var clients = getConnectionsByIds(connectionIdList);

for (var i = 0, len = clients.length; i < len; i++) {
    clients[i].respond(dataFromTheServer, 200);
}
```

###.addRequestHooks(hooks [object])

Adds hook functions to be executed on specified `controller` and `method`.

The hooks will be exeuted **BEFORE** the controller.

#### Example:

```
gracenode.addRequestHooks({
    foo: { 
            boo: fooBooHook
        }
});
```

The above example will execute a hook called `fooBooHook` when the server receives `/foo/boo` as the `endPoint`.

To add multiple hooks:

```
gracenode.addRequestHooks({
    foo: {
        boo: [
            fooBooHook,
            fooBooHook2
        ]
    }
});
```

#### How to assign request hook(s) to all methods of a controller

```
gracenode.addRequestHooks({
    foo: fooBooHook
});
```

The above example assigns a request hook function called `fooBooHook` to all methods of controller `foo`.

#### How to assign request hook(s) too all controller and their methods

```
gracenode.addRequestHooks(fooBooHook);
```

The above code assigns a request hook function called `fooBooHook` to all controller and their methods.

###.addResponseHook(hooks [object])

Adds hook functions to be executed on specified `controller` and `method` on every server response to the client.

The basic behavior of this function is the same as `addRequestHooks()`.

***

## Starting Socket Server

In your bootstrap code add:

```
gracenode.setup(function () {
    // gracenode is ready
    gracenode.socket.start();
});
```

***

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

***

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

***

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

***

## Request Object

A request object is passed to all controller method when the server receives the data from the client.

###.getConnectionId()

Returns a unique ID for this socket connection.

This is ID can be used to push data from the server to other clients.

###.data(dataName [string])

Returns the data sent from the client.

Example:

The data from the client:

```
{
    "foo": 1234
}
```

How to read the data on the server:

```
var foo = request.data('foo');
// 1234
```

###.set(keyName [string], value [mixed])

Sets the given value by `keyName` to be read by `.get()`.

###.get(keyName [string])

Reads the value set by the given `keyName`.

The value **MUST** be set by `.set()` before executing `.get()`.

***

## Response Object

A response object is passed to all controller method when the server receives the data from the client.

The server does **NOT** need to respond to the client like it would with `HTTP/HTTPS` protocols.

###.respond(data [mixed], status [int])

Sends the data to the client in `JSON` format.

The second argument `status` is optional. The `status` imitates the `HTTP` status code for easy use.

Default value of `status` is `200`.

###.error(code [string], message [string], status [int])

Sends a response to the client as an error. The data sent to the client is in `JSON` format.

The structure of the `JSON` would be:

```
{
    "code": "errorCode",
    "message": "errorMessage"
}
```

The optional argument `status` is an integer and imitates `HTTP` status code.

Default value of `status` is `400`.

***
