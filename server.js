var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);

var users = [];
var connections = [];

server.listen(3000, function () {
    console.log("Express Application started");
})

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

io.sockets.on('connection', function (socket) {
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    // Disconnect
    socket.on('disconnect', function (data) {
        users.splice(users.indexOf(socket.userName), 1);
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });

    // Send Message
    socket.on('send message', function (data) {
        io.sockets.emit('new message', { msg: data, user: socket.userName });
    });
});