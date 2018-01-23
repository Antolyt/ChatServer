// Simple chat server, which mangages login as user and sending of messages
// Saves messages in database

var express = require("express");               // get express pack
var app = express();                            // express app
var server = require("http").createServer(app); // server from http pack
var io = require("socket.io").listen(server);   // socket.io server
var mongo = require("mongodb").MongoClient;     // mongo database
var assert = require("assert");                 // handler of errors

var port = 3000;                                // server port
var users = [];                                 // names of logged in users
var connections = [];                           // all active connections to the chat
var dataUrl ='mongodb://localhost:27017/savedMessage'; // database

// Create server
server.listen(port, function () {
    console.log("Express Application started");
});

// Get html file
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

// Connect to database
mongo.connect(dataUrl, function (err, db) {

    // Setup io.sockets
    io.sockets.on('connection', function (socket) {
        // Add connection
        connections.push(socket);
        console.log('Connected: %s sockets connected', connections.length);

        // Get collection von database
        var collection;
        if (err) {
            // Send error if connecting is not possible
            sendConnectionError();
        } else {
            collection = db.collection('message');
        }

        // Get messages from database and send to client
        if (!err) {
            var messagesFromDB = [];
            var cursor = db.collection('message').find();
            cursor.forEach(function (doc, err) {
                assert.equal(null, err);
                messagesFromDB.push(doc);
            }, function () {
                db.close();
                io.sockets.emit('messages from database', messagesFromDB);
            });
        }

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
            var item = {
                msg: data,
                user: socket.userName
            };

            // Insert written message in database
            if (!err) {
                collection.insertOne(item, function (err, result) {
                    assert.equal(null, err);
                    console.log('Item inserted');
                    db.close();
                });
            }

            io.sockets.emit('new message', item);
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

    // Send error to client and console
    function sendConnectionError() {
        console.log('connection error accured');
        io.sockets.emit('connection error');
    }
});