var ws = require('nodejs-websocket');
var mh = require('./message-handler.js');
var Client = require('node-rest-client').Client;
var client = new Client();

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
                
                if (!!obj.data) {
                    conn.data = obj.data;
                    conn.isAnalyst = true;
                }
                else {
                    conn.isAnalyst = false;
                    server.connections.filter(function (c) { return c.from == conn.to; }).forEach(function (sc) {
                        conn.sendText({ initialData: sc.data });
                    });
                }
            }
            else {
                console.log("REC :" + conn.from + " " + str);
                
                
                
                if (conn.isAnalyst) {

                }

                server.connections.filter(function (c) { return c.from == conn.to; }).forEach(function (sc) {
                    if (conn.isAnalyst) {
                        var obj = JSON.parse(str);
                        conn.data = getOriginal(conn.data, obj);
                    }
                    else {
                        var obj = JSON.parse(str);
                        sc.data = getOriginal(conn.data, obj);
                    }
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
        console.log("connection is closed", conn.data);
    });

}).listen(8001);


function getChanges(oldString, newString) {
    var addedIndex = false;
    var changes = [];
    var obj = [];
    var oi = 0, ni = 0;
    while (oi < oldString.length && ni < newString.length) {
        if (newString.charAt(ni) != oldString.charAt(oi)) {
            if (!addedIndex) {
                obj.push(oi);
                obj.push(newString.charAt(ni));
                addedIndex = true;
            }
            else {
                obj[1] += newString.charAt(ni);
            }
            ni++;
        }
        else {
            if (addedIndex) {
                changes.push(obj);
                obj = [];
                addedIndex = false;
            }
            oi++;
            ni++;
        }
    };
    if (addedIndex) {
        changes.push(obj);
        obj = [];
        addedIndex = false;
    }
    obj = [];
    if (ni == newString.length && oi < oldString.length) {
        obj.push(-1 * oi);
        changes.push(obj);
    }
    if (oi == oldString.length && ni < newString.length) {
        obj.push(ni);
        obj.push(newString.substring(ni));
        changes.push(obj);
    }
    return changes;
}
function getOriginal(oldStrings, changes) {
    var result = oldStrings;
    for (var i = changes.length - 1; i >= 0  ; i--) {
        if (changes[i][0] < 0) {
            result = result.substring(0, -1 * changes[i][0]);
        }
        else {
            result = result.substring(0, changes[i][0]) + changes[i][1] + result.substring(changes[i][0]);
        }
    };
    return result;
}