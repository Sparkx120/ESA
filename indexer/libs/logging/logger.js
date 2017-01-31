/** @module libs/logging/logger */

import bunyan from "bunyan";

/** Class used for logging messages. */
export default class Logger {

    /**
     * Creates an instance of Logger.
     * 
     * @author Jonathan Tan
     * @param {boolean} verbose - The verbosity of logging.
     */
    constructor(verbose) {
        // base logging configuration
        this._config = {
            name: "esa",
            streams: []
        };

        // specify verbosity
        if (verbose == true) {
            this._config.streams.push({
                level: "debug",
                stream: process.stdout
            });
        } else {
            this._config.streams.push({
                level: "info",
                stream: process.stdout
            });
        }
    }

    /**
     * Constructs a logger object.
     * 
     * @author Jonathan Tan
     * @returns {bunyan.Logger} A logger object.
     */
    createLogger() {
        return bunyan.createLogger(this._config);
    }
}
