var express = require("express");               // get express pack
var app = express();                            // express app
var server = require("http").createServer(app); // server from http pack
var io = require("socket.io").listen(server);   // socket.io server

var users = [];                                 // names of logged in users
var connections = [];                           // all active connections to the chat

// Create server
server.listen(3000, function () {
    console.log("Express Application started");
})

// Get html file
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

// Setup io.sockets
io.sockets.on('connection', function (socket) {
    // Add connection
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    // Disconnect - Remove user and its connection
    socket.on('disconnect', function (data) {
        // Remove username
        users.splice(users.indexOf(socket.userName), 1);
        updateUsers();
        // Remove connection
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });

    // Send Message - Get message from frontend of an user and send it to other users
    socket.on('send message', function (data) {
        io.sockets.emit('new message', { msg: data, user: socket.userName });
    });

    //New User - Get username from frontend and add name to users
    socket.on('new user', function (data, callback) {
        // Get username from frontend
        callback(true);
        socket.userName = data;
        // Add name to users
        users.push(socket.userName);
        updateUsers();
    });

    // Send message to frontend to update list of logged in users
    function updateUsers() {
        io.sockets.emit('get users', users);
    }
});