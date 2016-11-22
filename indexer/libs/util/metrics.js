// logging module
import logger from "../logging/logger";

class FileMetrics {
    constructor() {
        this._filesIndexed = 0;
        this._directoriesIndexed = 0;
        this._unknownCount = 0;

        this._startTimer = process.hrtime();
    }

    /* Save the current metrics to the logger. */
    logMetrics() {
        logger.info("# of files indexed: %d", this._filesIndexed);
        logger.info("# of directories indexed: %d", this._directoriesIndexed);
        logger.debug("# of unknown files: %d", this._unknownCount);

        const endTimer = process.hrtime(this._startTimer);
        logger.debug("Execution time: %ds", endTimer[0] + endTimer[1] / 1E9);
    }

    /* setters and getters */
    set filesIndexed(num)       { this._filesIndexed = num; }
    get filesIndexed()          { return this._filesIndexed; }
    set directoriesIndexed(num) { this._directoriesIndexed = num; }
    get directoriesIndexed()    { return this._directoriesIndexed; }
    set unknownCount(num)       { this._unknownCount = num; }
    get unknownCount()          { return this._unknownCount; }
}

export {FileMetrics};
