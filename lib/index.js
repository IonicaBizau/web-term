// Dependencies
var Pty = require("pty.js");

// Constructor
function WebTerm() {
    this.terminal = null;
}

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
WebTerm.prototype.create = function (options, callback) {

    this.terminal = Pty.fork(process.env.SHELL, [], {
        name: options.name || "Browser Term",
        cols: options.cols,
        rows: options.rows,
        cwd: options.cwd || process.env.HOME
    });

    this.terminal.on("data", function(data) {
        options.socket.emit("data", data);
    });

    this.terminal.on("close", function() {
        options.socket.emit("kill");
        WebTerm.kill();
    });

    return this.terminal;
};

/**
 * data
 * Writes data in the `WebTerm` instance.
 *
 * @name data
 * @function
 * @param {Buffer} data The buffer to write.
 * @return {undefined}
 */
WebTerm.prototype.data = function (data) {
    if (!this.terminal) { return; }
    this.terminal.write(data);
};

/**
 * kill
 * Destroys the `WebTerm` instance.
 *
 * @name kill
 * @function
 * @return {undefined}
 */
WebTerm.prototype.kill = function () {
    if (!this.terminal) { return; }
    this.terminal.destroy();
    this.terminal = null;
};

/**
 * resize
 * Resizes the terminal.
 *
 * @name resize
 * @function
 * @param {Number} cols The number of columns.
 * @param {Number} rows The number of rows.
 * @return {undefined}
 */
WebTerm.prototype.resize = function (cols, rows) {
    if (!this.terminal) { return; }
    this.terminal.resize(cols, rows);
};

module.exports = new WebTerm();
