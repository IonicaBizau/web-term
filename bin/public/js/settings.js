var palettes = {
    "solarized": {
        "description": "Precision colors for machines and people",
        "notes": ["Uses \"brights\" for new colors"],
        "website": "http://ethanschoonover.com/solarized",
        "colors": [
            "#073642",
            "#dc322f",
            "#859900",
            "#b58900",
            "#268bd2",
            "#d33682",
            "#2aa198",
            "#eee8d5",
            "#002b36",
            "#cb4b16",
            "#586e75",
            "#657b83",
            "#93a1a1",
            "#6c71c4",
            "#839496",
            "#fdf6e3",

            "#002b36",
            "#839496"
        ]
    }
}
function selectPalette(palette){
    for(var i = 0; i < palettes[palette].colors.length; i++){
        $('form').find('input[data-field="colors.palette.'+i+'"]').val(palettes[palette].colors[i])
    }
    $(".btn-primary").removeAttr("disabled", "disabled")
}
function fillSubForm(){
}
$(document).ready(function () {
    var $form = $("form").serializer();
    $.getJSON("/api/settings/get", function (json) {
        $form.trigger("serializer:fill", json);
    });
    var $submitButton = $(".btn-primary");
    $submitButton.attr("disabled", "disabled");
    $form.on("change", function () {
        $submitButton.removeAttr("disabled", "disabled");
    });
    $form.on("serializer:data", function (ev, data) {
        data.colors.palette = $.map(data.colors.palette,
            function(value) { return value; }
       );
        $.ajax({
            url: "/api/settings/save"
          , data: JSON.stringify(data)
          , dataType: "json"
          , contentType : 'application/json'
          , type: "POST"
          , success: function () {
                $submitButton.attr("disabled", "disabled");
            }
          , error: function (xhr, code, error) {
                alert(code + ":" + error);
            }
        });
    });

    $.each(palettes, function(name, data){
        var styles = (data.colors[17]) ? (
            'style="background-color:' + data.colors[16] + ';' +
                   "color: " + data.colors[17] + '"' 
        ) : ''; 
            
        function addNote(note){ return "    <p class='row note'>" + note + "</p>"}
        function addColor(color){
            return "      <div style='background-color: "+color+"'></div>"
        }
        $('.palettes').append($([
          "<button " + styles + " type='button' class='palette form-control' onclick='selectPalette(\"" + name + "\")'>",
          "  <img src='" + (data.img || ('img/palettes/' + name + '.png')) + "'/>",
          "  <div class='detail'>",
          data.description ? "    <p class='row desc'>" + data.description + "</p>" : "",
          "    <div class='colors'>",
          $.map(data.colors, addColor).join("\n"),
          "    </div>",
          data.notes ? $.map(data.notes, addNote).join("\n") : "",
          "  </div>",
          "</button>"
        ].join("\n")))
      })
});
