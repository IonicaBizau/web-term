if (typeof require === "function") {
    var $ = require("./jquery")
      , Terminal = require("./term")
      ;
}

(function ($) {
    var EventEmitter = Terminal.EventEmitter;

    blm("Do you really want to leave? You will lose this terminal session.");

    // Text size plugin
    $.fn.textSize = function () {
        var $self = this;

        function getOuterDimensions (elementDOM, row) {
            row = row || elementDOM;
            var boundingBox = elementDOM.getBoundingClientRect()
              , rowBouding = row.getBoundingClientRect()
              , width = boundingBox.width
              , height = rowBouding.height
              , computed = getComputedStyle(elementDOM)
              , computedRow = getComputedStyle(row)
              ;

            width = width + parseInt(computed.marginRight) + parseInt(computed.marginLeft);
            height = height + parseInt(computedRow.marginTop) + parseInt(computedRow.marginBottom);

            return {
                width: width,
                height: height
            }
        }

        var row = $(".terminal > div:eq(1)");
        if (row.length && row.height() < 30) {
            row = row.get(0);
        } else {
            row = null;
        }

        var span = document.createElement("span");
        var newContent = document.createTextNode("o");
        span.appendChild(newContent);
        $self.get(0).children[0].appendChild(span)

        var charSize = getOuterDimensions(span, row);
        var targetSize = getOuterDimensions($self.get(0));

        span.remove();

        return {
            x: Math.floor(targetSize.width / charSize.width)
          , y: Math.floor(targetSize.height / charSize.height)
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

            term.socket.emit("resize", term.w.cols, term.w.rows);
            term.tab.resize(term.w.cols, term.w.rows);
        };

        var _resizeTimer = null;
        $(window).on("resize", function () {
            clearTimeout(_resizeTimer);
            _resizeTimer = setTimeout(term.updateSize, 100);
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
                rows: win.rows,
                colors: [ // from ethanschoonover.com/solarized
                    "#073642", //$base02
                    "#e74c3c", //$red
                    "#2ecc71", //$green
                    "#f1c40f", //$yellow
                    "#3498db", //$blue
                    "#9b59b6", //$magenta
                    "#1abc9c", //$cyan

                    "#eee8d5", //$base2
                    "#002b36", //$base03
                    "#cb4b16", //$orange
                    "#586e75", //$base01
                    "#657b83", //$base00
                    "#e67e22", //$base1
                    "#6c71c4", //$violet
                    "#839496", //$base0
                    "#fdf6e3", //$base3
                    "#002b36",  //$base03 and background
                    "#ecf0f1"
                ]
            });

            // Create the terminal
            term.socket.emit("create", win.cols, win.rows, function(err, data) {
                if (err) return self._destroy();
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
                window.close()
            });


            tab.open(win.$.get(0));
            tab.focus();
            tab.on("data", function (data) {
                term.socket.emit("dataToServer", data);
            });

            win.bind();

            term.emit("load");
            term.emit("open");
            term.updateSize();
        }

        // Open the terminal
        openTerm();
    };
})($);

$(document).ready(function() {
    $(".container").webTerm();
});
