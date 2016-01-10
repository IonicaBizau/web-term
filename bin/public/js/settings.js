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
});
