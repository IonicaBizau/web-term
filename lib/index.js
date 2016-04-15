"use strict";

// Dependencies
const pty = require("pty.js")
    , ul = require("ul")
    , deffy = require("deffy")
    , abs = require("abs")
    , readJson = require("r-json")
    , writeJson = require("w-json")
    , fwatch = require("fwatcher")
    ;

class WebTerm {
    /**
     * WebTerm
     * Creates a new `WebTerm` instance.
     *
     * @name WebTerm
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
     * @return {WebTerm} The `WebTerm` instance.
     */
    constructor (options) {
        this.terminal = null;
        WebTerm.sockets.push(options.socket);

        // Default shell
        options.shell = deffy(options.shell, process.env.SHELL || "bash");

        if (options.ptyOptions && options.ptyOptions.env && options.inheritEnv !== false) {
            options.ptyOptions.env = ul.merge(options.ptyOptions.env, process.env);
        }

        // Create the terminal
        this.terminal = pty.fork(options.shell, [], ul.merge({
            cols: options.cols
          , rows: options.rows
          , cwd: options.cwd || ul.home()
        }, options.ptyOptions));

        // Terminal -> Socket
        this.terminal.on("data", data => options.socket.emit("data", data));

        // Close terminal
        this.terminal.on("close", () => {
            options.socket.emit("kill");
            this.kill();
        });

        // Handle the start app
        if (typeof options.start === "string") {
            this.terminal.write(options.start + "\r");
        }
    }

    /**
     * sendTerminalSettings
     * Sends the terminal settings accross the sockets.
     *
     * @name sendTerminalSettings
     * @function
     * @param {Function} callback The callback function.
     */
    static sendTerminalSettings (callback) {
        WebTerm.readSettings((err, data) => {
            WebTerm.sockets.forEach(c => c.emit("terminalSettings", err, data));
        });
    }

    /**
     * _watchConfig
     * Watches the config file for changes.
     *
     * @name _watchConfig
     * @function
     */
    static _watchConfig () {
        if (WebTerm._watchedConfig) {
            WebTerm._watchedConfig.off();
        }
        WebTerm._watchedConfig = fwatch(WebTerm.config_file_path, WebTerm.sendTerminalSettings);
    }

    /**
     * readSettings
     * Reads the settings from the config file.
     *
     * @name readSettings
     * @function
     * @param {Function} callback The callback function.
     */
    static readSettings (callback) {
        readJson(WebTerm.config_file_path, (err, data) => {
            if (err) { data = {}; }
            data = ul.deepMerge(data, WebTerm.defaultSettings);
            callback(null, data);
        });
    }

    /**
     * writeSettings
     * Writes the settings in the config file.
     *
     * @name writeSettings
     * @function
     * @param {Object} data The new settings.
     * @param {Function} callback The callback function.
     */
    static writeSettings (data, callback) {
        writeJson(WebTerm.config_file_path, data, callback);
    }

    /**
     * data
     * Writes data in the `WebTerm` instance.
     *
     * @name data
     * @function
     * @param {Buffer} data The buffer to write.
     */
    data (data) {
        if (!this.terminal) { return; }
        this.terminal.write(data);
    }

    /**
     * kill
     * Destroys the `WebTerm` instance.
     *
     * @name kill
     * @function
     */
    kill () {
        if (!this.terminal) { return; }
        this.terminal.destroy();
        this.terminal = null;
    }

    /**
     * resize
     * Resizes the terminal.
     *
     * @name resize
     * @function
     * @param {Number} cols The number of columns.
     * @param {Number} rows The number of rows.
     */
    resize (cols, rows) {
        if (!this.terminal) { return; }
        this.terminal.resize(cols, rows);
    }
}

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
WebTerm.config_file_path = abs("~/.web-term.json");
WebTerm.sockets = [];

module.exports = WebTerm;
