var Pty = require("pty.js");

var Tty = module.exports = {};

var _term = null;

Tty.create = function (options, callback) {

    _term = Pty.fork(process.env.SHELL, [], {
        name: "Browser Term",
        cols: options.cols,
        rows: options.rows,
        cwd: process.env.HOME
    });

    _term.on("data", function(data) {
        options.socket.emit("data", data);
    });

    _term.on("close", function() {
        options.socket.emit("kill");
        Tty.kill();
    });

    return _term;
};

Tty.data = function (data) {
    if (!_term) { return; }
    _term.write(data);
};

Tty.kill= function () {
    if (!_term) { return; }
    _term.destroy();
    _term = null;
};

Tty.resize= function () {
    if (!_term) { return; }
    _term.resize(cols, rows);
};

Tty.process= function (callback) {
    if (!_term) { return; }
    callback(_term.process);
};

Tty.disconnect= function () {
    // TODO
};

Tty.paste= function (callback) {
    // TODO
    callback();
};
