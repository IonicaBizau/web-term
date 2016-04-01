// Dependencies
var pty = require("pty.js")
  , ul = require("ul")
  , deffy = require("deffy")
  , abs = require("abs")
  , readJson = require("r-json")
  , writeJson = require("w-json")
  , fwatch = require("fwatcher")
  ;

/**
 * WebTerm
 * Creates a new `WebTerm` instance.
 *
 * @name WebTerm
 * @function
 * @return {WebTerm} The `WebTerm` instance.
 */
function WebTerm (options) {
    this.terminal = null;
    this.create(options);
}

WebTerm.config_file_path = abs("~/.web-term.json");

/**
 * create
 * Creates a new terminal instance.
 *
 * @name create
 * @function
 * @param {Object} options Creates a new terminal instance:
 *
 *  - `cols` (Number): The number of columns.
 *  - `rows` (Number): The number of rows.
 *  - `cwd` (String): The current working directory (default: the home directory).
 *  - `shell` (String): The shell to start (by default the shell).
 *  - `start` (String): The start program.
 *  - `ptyOptions` (Object): Custom options for the pty.js fork call
 *  - `inheritEnv` (Boolean): If `false`, it will prevent web-term to take the environment variables from the main process.
 *
 * @return {Terminal} The terminal instance.
 */
WebTerm.prototype.create = function (options, callback) {

    var self = this;

    // Default shell
    options.shell = deffy(options.shell, process.env.SHELL || "bash");
    WebTerm.sockets.push(options.socket);

    if (options.ptyOptions && options.ptyOptions.env && options.inheritEnv !== false) {
        options.ptyOptions.env = ul.merge(options.ptyOptions.env, process.env);
    }

    // Create the terminal
    self.terminal = pty.fork(options.shell, [], ul.merge({
        cols: options.cols
      , rows: options.rows
      , cwd: options.cwd || ul.home()
    }, options.ptyOptions));

    // Terminal -> Socket
    self.terminal.on("data", function(data) {
        options.socket.emit("data", data);
    });

    // Close terminal
    self.terminal.on("close", function() {
        options.socket.emit("kill");
        self.kill();
    });

    // Handle the start app
    if (typeof options.start === "string") {
        self.terminal.write(options.start + "\r");
    }

    return self.terminal;
};

WebTerm.sockets = [];
WebTerm.defaultSettings = {
    general: {
        font_size: 11
      , shell: "bash"
      , start_command: ""
    }
  , colors: {
        background: '#000000'
      , foreground: '#f0f0f0'
      , palette: [
            // Dark
            "#2e3436"
          , "#cc0000"
          , "#4e9a06"
          , "#c4a000"
          , "#3465a4"
          , "#75507b"
          , "#06989a"
          , "#d3d7cf"
            // Bright
          , "#555753"
          , "#ef2929"
          , "#8ae234"
          , "#fce94f"
          , "#729fcf"
          , "#ad7fa8"
          , "#34e2e2"
          , "#eeeeec"
        ]
    }
};

/**
 * sendTerminalSettings
 * Sends the terminal settings accross the sockets.
 *
 * @name sendTerminalSettings
 * @function
 * @param {Function} callback The callback function.
 */
WebTerm.sendTerminalSettings = function (callback) {
    WebTerm.readSettings(function (err, data) {
        WebTerm.sockets.forEach(function (socket) {
            socket.emit("terminalSettings", err, data);
        });
    });
};

/**
 * _watchConfig
 * Watches the config file for changes.
 *
 * @name _watchConfig
 * @function
 */
WebTerm._watchConfig = function () {
    if (WebTerm._watchedConfig) {
        WebTerm._watchedConfig.off();
    }
    WebTerm._watchedConfig = fwatch(WebTerm.config_file_path, WebTerm.sendTerminalSettings);
};

/**
 * readSettings
 * Reads the settings from the config file.
 *
 * @name readSettings
 * @function
 * @param {Function} callback The callback function.
 */
WebTerm.readSettings = function (callback) {
    readJson(WebTerm.config_file_path, function (err, data) {
        if (err) { data = {}; }
        data = ul.deepMerge(data, WebTerm.defaultSettings);
        callback(null, data);
    });
};

/**
 * writeSettings
 * Writes the settings in the config file.
 *
 * @name writeSettings
 * @function
 * @param {Object} data The new settings.
 * @param {Function} callback The callback function.
 */
WebTerm.writeSettings = function (data, callback) {
    writeJson(WebTerm.config_file_path, data, callback);
};

/**
 * data
 * Writes data in the `WebTerm` instance.
 *
 * @name data
 * @function
 * @param {Buffer} data The buffer to write.
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
 */
WebTerm.prototype.resize = function (cols, rows) {
    if (!this.terminal) { return; }
    this.terminal.resize(cols, rows);
};

module.exports = WebTerm;
