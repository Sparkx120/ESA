/** @module libs/logging/logger */

import bunyan from "bunyan";

export default bunyan.createLogger({
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
