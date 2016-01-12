var palettes = {
    "solarized": {
        "header": "<span style='color: #b58900'>SOLARIZED</span>",
        "description": "Precision colors for machines and people",
        "notes": ["<p class='note' style='color: #dc322f'>Uses \"brights\" for new colors</p>"],
        "website": "http://ethanschoonover.com/solarized",
        "background": "#002b36",
        "foreground": "#839496",
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
        ]
    }
}
function selectPalette(palette){
    for(var i = 0; i < palettes[palette].colors.length; i++){
        $('form').find('input[data-field="colors.palette.'+i+'"]')
            .val(palettes[palette].colors[i])
    }
    if(palettes[palette].foreground)
        $('form').find('input[data-field="colors.foreground"]')
            .val(palettes[palette].foreground);
    if(palettes[palette].background)
        $('form').find('input[data-field="colors.background"]')
            .val(palettes[palette].background);
    $(".btn-primary").removeAttr("disabled", "disabled")
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
       console.log(data)
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
        styles = 'style="';
        if(data.background)
            styles += 'background-color:' + data.background + ';';
        if(data.foreground)
             styles += "color:" + data.foreground + ';'; 
        styles += '"';
            
        function addNote(note){
            return "    " +
                note.substring(0,4) == '<div' ? note :
                "<p class='note'>" + note + "</p>"
        }
        function addColor(color){
            return "      <div style='background-color: "+color+"'></div>"
        }
        $('.palettes').append($([
          "<button " + styles + " type='button' class='palette form-control' onclick='selectPalette(\"" + name + "\")'>",
          "  <img src='" + (data.img || ('img/palettes/' + name + '.png')) + "'/>",
          "  <div class='detail'>",
          "    <h4 class='name'>" + (data.header || name) + "</h4>",
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
