(function ($) {
    var EventEmitter = Terminal.EventEmitter;

    // Text size plugin
    $.fn.textSize = function () {
        var $self = this;
        function getCharWidth() {
            var canvas = getCharWidth.canvas || (getCharWidth.canvas = $("<canvas>")[0])
              , context = canvas.getContext("2d")
              ;

            context.font = [$self.css("font-size"), $self.css("font-family")].join(" ");
            var metrics = context.measureText("3");
            return metrics.width;
        };

        var lineHeight = parseFloat(getComputedStyle($self[0]).lineHeight);
        return {
            x: Math.floor($self.width() / getCharWidth())
          , y: Math.floor($self.height() / lineHeight)
        };
    };

    // Web Term plugin
    $.fn.webTerm = function () {
        var $self = this;
        var term = new EventEmitter;
        var inherits = Terminal.inherits;

        term.updateSize = function () {
            var tSize = $(".terminal").textSize();
            term.w.cols = tSize.x || Terminal.geometry[0];
            term.w.rows = tSize.y || Terminal.geometry[1];

            term.socket.emit("resize", term.id, term.w.cols, term.w.rows);
            term.tab.resize(term.w.cols, term.w.rows);
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
            win.$.addClass("webTerm-window");

            win.bind = function () {
                win.$.on("mousedown", function(ev) {
                    term.tab.focus();
                });
            };

            var $bar = $("<div>").addClass("bar");
            var $button = $("<div>").addClass("grip");
            var $title = $("<div>").addClass("title");

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
            term.socket.on("data", function(data) {
                tab.write(data);
            });

            // Listen for kill event
            term.socket.on("kill", function() {
                term._destroy();
            });


            tab.open(win.$.get(0));
            tab.focus();
            tab.on("data", function (data) {
                term.socket.emit("data", data);
            });

            win.bind();

            term.emit("load");
            term.emit("open");
            setTimeout(function() {
            term.updateSize();
            }, 0);
        }

        // Open the terminal
        openTerm();
    };
})($);

$(document).ready(function() {
    $(".container").webTerm();
});
