// Dependencies
var Pty = require("pty.js");

// Constructor
var WebTerm = module.exports = {};

// The global terminal object
var _term = null;

/**
 * create
 * Creates a new terminal instance.
 *
 * @name create
 * @function
 * @param {Object} options Creates a new terminal instance.
 * @param {Function} callback The callback function.
 * @return {WebTerm} The terminal instance.
 */
WebTerm.create = function (options, callback) {

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
        WebTerm.kill();
    });

    return _term;
};

WebTerm.data = function (data) {
    if (!_term) { return; }
    _term.write(data);
};

WebTerm.kill= function () {
    if (!_term) { return; }
    _term.destroy();
    _term = null;
};

WebTerm.resize= function (cols, rows) {
    if (!_term) { return; }
    _term.resize(cols, rows);
};

WebTerm.process= function (callback) {
    if (!_term) { return; }
    callback(_term.process);
};
