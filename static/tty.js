(function ($) {
    var EventEmitter = Terminal.EventEmitter;
    $.fn.tty = function () {
        var $self = this;
        var term = new EventEmitter;
        var inherits = Terminal.inherits;

        term.updateSize = function () {
            //TODO
            return;
            var $terminal = $(".terminal", $self);
            var x = Math.floor($terminal.width() / 6.6);
            var y = Math.floor($terminal.height() / 5.539);

            term.w.cols = x;
            term.w.rows = y;

            term.socket.emit("resize", term.id, x, y);
            //term.tab.resize(x, y);
            term.tab.reset();
        };

        var _resizeTimer = null;
        $(window).on("resize", function () {
            clearTimeout(_resizeTimer);
            _resizeTimer = setTimeout(term.updateSize, 500);
        });

        function openTerm() {
            term.socket = io.connect();

            // Initialize ui
            /// Create the window
            var win = term.w = new EventEmitter;
            win.$ = $self;
            win.$.addClass("tty-window");

            win.bind = function () {
                win.$.on("mousedown", function(ev) {
                    term.tab.focus();
                });
            };

            var $bar = $("<div>").addClass("bar");
            var $button = $("<div>").addClass("grip");
            var $title = $("<div>").addClass("title");

            //TODO
            var x = Math.floor($(window).width() / 6.8);
            var y = Math.floor($(window).height() / 13.25);
            win.cols = x || Terminal.geometry[0];
            win.rows = y || Terminal.geometry[1];

            $self.append($bar);
            $bar.append($title);

            /// Create the tab
            var tab = term.tab = Terminal.call(term, {
                cols: win.cols,
                rows: win.rows
            });

            // Create the terminal
            term.socket.emit("create", win.cols, win.rows, function(err, data) {
                if (err) return self._destroy();
                term.pty = data.pty;
                term.id = data.id;
                $title.text(data.process);
                term.emit("open tab", term);
                term.emit("open");
                term.updateSize();
            });

            // Listen for connect
            term.socket.on("connect", function() {
                term.emit("connect");
            });

            // Listen for data
            term.socket.on("data", function(id, data) {
                tab.write(data);
            });

            // Listen for kill event
            term.socket.on("kill", function(id) {
                term._destroy();
            });


            tab.open(win.$.get(0));
            tab.focus();
            tab.on("data", function (data) {
                term.socket.emit("data", term.id, data);
            });

            win.bind();

            term.emit("load");
            term.emit("open");

        }

        // Open the terminal
        openTerm();
    };
})($);

$(document).ready(function() {
    $(".container").tty();
});
