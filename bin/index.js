// Dependencies
var Lien = require("lien");

// Init lien server
var server = new Lien({
    host: "localhost"
  , port: 8080
  , root: __dirname + "/public"
});

// Add page
server.page.add("/", function (lien) {
    lien.file("/index.html");
});
