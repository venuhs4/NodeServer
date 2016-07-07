var ws = require('nodejs-websocket');
var mh = require('./message-handler.js');

var server = ws.createServer(function (conn) {
    var reg = false;
    conn.on("text", function (str) {
        try {
            if (!reg) {
                var obj = JSON.parse(str);
                conn.from = obj.from;
                conn.to = obj.to;
                reg = true;
                console.log("Connection request:", obj);
            }
            else {
                console.log("REC :" + conn.from + " " + str);
                server.connections.filter(function (c) { return c.from == conn.to; }).forEach(function (sc) {
                    sc.sendText(str);
                    console.log("SENT:" + conn.to + " " + str);
                });
            }
        }
        catch (e) {
            console.log(e);
        }
    });

    conn.on("close", function () {
        console.log("connection is closed");
    });

}).listen(8001);