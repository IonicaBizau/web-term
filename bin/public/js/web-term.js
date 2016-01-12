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
                colors: [
                    '#073642', //$base02
                    '#dc322f', //$red
                    '#859900', //$green
                    '#b58900', //$yellow
                    '#268bd2', //$blue
                    '#d33682', //$magenta
                    '#2aa198', //$cyan
                    '#eee8d5', //$base2

                    '#002b36', //$base03
                    '#cb4b16', //$orange
                    '#586e75', //$base01
                    '#657b83', //$base00
                    '#93a1a1', //$base1
                    '#6c71c4', //$violet
                    '#839496', //$base0
                    '#fdf6e3', //$base3 

                    '#002b36', '#839496'
                ]
            });

            // Create the terminal
            term.socket.emit("create", win.cols, win.rows, function(err, data) {
                if (err) return self._destroy();
                term.emit("open tab", term);
                term.emit("open");
                term.updateSize();
            });

            // Listen for connet
            term.socket.on("connect", function() {
                term.emit("connect");
            });

            // Listen for data
            term.socket.on("data", function(data) {
                tab.write(data);
            });

            if(document.copyEnabled == true){
                console.log('enabling copy')
                // Listen for copy commands
                $('button.copy').click(function(event) {
                    copyTextToClipboard($('.clipboard').text());
                });
                term.socket.on("copy", function(text) {
                    $('.clipboard').text(text);
                });
            }

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
    $(".container").webTerm();
});
