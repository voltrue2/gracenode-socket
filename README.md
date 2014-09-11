# gracenode-socket

TCP socket server for gracenode framework.

## To DO

#### Implement TLS for safe communication

#### Complete the documentation

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
        "host": <IP address or host name>,
        "port": <port number>,
        "controllerPath": </path/to/your/controller/directory/>,
        "reroute": [
            { "from": "/from/here", "to": "/reroute/here" }
        ]
    }
}
```

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
