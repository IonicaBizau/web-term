$.getJSON('http://ipinfo.io/json', function(data) {
var i = 1;

var output="<ul>";
for (i = 0; i<1; i++) {
    output+=
    "<li>IP: " + data.ip + "</li>" +
    "<li>LC: " + data.loc + "</li>" +
    "<li>CY: " + data.city + "</li>";
}

output+="</ul>";
document.getElementById("iphost").innerHTML=output;

});
