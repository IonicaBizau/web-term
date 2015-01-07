// Dependencies
var Lien = require("lien");

// Init lien server
var server = new Lien({
    host: "localhost"
  , port: 8080
});

// Add page
server.page.add("/", { get: "/index.html" });
