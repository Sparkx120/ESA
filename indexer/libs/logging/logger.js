/** @module libs/logging/logger */

import args from "../args/argsmaster";
import bunyan from "bunyan";

let config = {
    name: "esa",
    streams: []
};

// specify verbosity
if (args.verbose == true) {
    config.streams.push({
        level: "debug",
        stream: process.stdout
    });
} else {
    config.streams.push({
        level: "info",
        stream: process.stdout
    });
}

export default bunyan.createLogger(config);
