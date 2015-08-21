(function ($) {
    var EventEmitter = Terminal.EventEmitter;

    //blm("Do you really want to leave? You will lose this terminal session.");

    // Text size plugin
    $.fn.textSize = function () {
        var $self = this;

        var span = document.createElement("span");
        var newContent = document.createTextNode("o");

        function getOuterDimensions (elementDOM) {
            var width,
            height;
            var boundingBox = elementDOM.getBoundingClientRect();

            // Get the width and height without margins
            width = boundingBox.width;
            height = boundingBox.height;

            // Add margins to the width and height
            var computed = getComputedStyle(elementDOM);
            width = width + parseInt(computed.marginRight) + parseInt(computed.marginLeft);
            height = height + parseInt(computed.marginTop) + parseInt(computed.marginBottom);

            return {
                width: width,
                height: height
            }
        }

        span.appendChild(newContent);
        $self.get(0).children[0].appendChild(span)

        var charSize = getOuterDimensions(span);
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
                window.close()
            });


            tab.open(win.$.get(0));
            tab.focus();
            tab.on("data", function (data) {
                term.socket.emit("data", data);
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
    $(".container-term").webTerm();
    $(".container-term2").webTerm.create();
    //  $(".container-term2").terminal.create();
});
