$(document).ready(function () {
    var $form = $("form").serializer();
    $.getJSON("/api/settings/get", function (json) {
        $form.trigger("serializer:fill", json);
    });
    $form.on("serializer:data", function (ev, data) {
        $.ajax({
            url: "/api/settings/save"
          , data: JSON.stringify(data)
          , dataType: "json"
          , contentType : 'application/json'
          , type: "POST"
        }, function () {

        });
    });
});
