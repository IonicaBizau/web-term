#!/usr/bin/env node

// Dependencies
var Lien = require("lien")
  , Tty = require(__dirname + "/../lib/tty.js")
  , Pty = require("pty.js")
  , SocketIO = require("socket.io")
  ;

// Init the server
var app = new Lien({
    host: "localhost"
  , port: 9000
});

// Init Socket.IO
app.io = SocketIO.listen(app._server, {
    log: false
});

app.io.configure(function() {
    app.io.disable("log");
});

// Handle connections
app.io.sockets.on("connection", function(socket) {
    var req = socket.handshake;
    var user = req.user;

    socket.on("create", function(cols, rows, callback) {
        Tty.create({
            cols: cols
          , rows: rows
          , socket: socket
        }, callback);
    });

    socket.on("data", function(data) {
        Tty.data(data);
    });

    socket.on("kill", function() {
        Tty.kill();
    });

    socket.on("resize", function(cols, rows) {
        Tty.resize(cols, rows);
    });

    socket.on("process", function(callback) {
        Tty.process(callback);
    });

    socket.on("disconnect", function() {
        Tty.disconnect();
    });

    socket.on("request paste", function(callback) {
        Tty.paste(callback);
    });
});
