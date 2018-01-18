var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);

server.listen(3000, function () {
    console.log("Express Application started");
})

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});