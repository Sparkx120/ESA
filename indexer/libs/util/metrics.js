// logging module
import {logger} from "../logging/logger";

class FileMetrics {
    constructor() {
        this._filesIndexed = 0;
        this._directoriesIndexed = 0;
        this._errors = 0;

        this._startTimer = process.hrtime();
    }

    /* Save the current metrics to the logger. */
    logMetrics() {
        logger.debug("# of files indexed: %d", this._filesIndexed);
        logger.debug("# of directories indexed: %d", this._directoriesIndexed);
        logger.debug("# of errors: %d", this._errors);

        const endTimer = process.hrtime(this._startTimer);
        logger.debug("Execution time: %ds", endTimer[0] + endTimer[1] / 1E9);
    }

    /* setters and getters */
    set filesIndexed(num)       { this._filesIndexed = num; }
    get filesIndexed()          { return this._filesIndexed; }
    set directoriesIndexed(num) { this._directoriesIndexed = num; }
    get directoriesIndexed()    { return this._directoriesIndexed; }
    set errors(num)             { this._errors = num; }
    get errors()                { return this._errors; }
}

export { FileMetrics };
