// logging module
var bunyan = require('bunyan');

// filesystem module
var fs = require("fs");

// create log files
if (!fs.existsSync("logs")){
    fs.mkdirSync("logs");
}
fs.closeSync(fs.openSync("logs/info.log", "w"));
fs.closeSync(fs.openSync("logs/verbose.log", "w"));

export var logger = bunyan.createLogger({
    name: "esa",
    streams: [
        {
            path: "logs/info.log",
            level: "info"
        },
        {
            path: "logs/verbose.log",
            level: "debug"
        }
    ]
});
