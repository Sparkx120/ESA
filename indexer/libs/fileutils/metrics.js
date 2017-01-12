/** @module libs/fileutils/metrics */

import logger from "../logging/logger";

/** This class is used to keep track of various file-related metrics while processing. */
export default class FileMetrics {

    /**
     * Creates an instance of FileMetrics.
     * 
     * @author Jonathan Tan
     */
    constructor() {
        this._filesIndexed = 0;
        this._directoriesIndexed = 0;
        this._unknownCount = 0;

        this._startTimer = process.hrtime();
    }

    /**
     * Save the current metrics to the logger.
     * 
     * @author Jonathan Tan
     */
    logMetrics() {
        logger.info(`# of files indexed: ${this._filesIndexed}`);
        logger.info(`# of directories indexed: ${this._directoriesIndexed}`);
        logger.info(`# of unknown files: ${this._unknownCount}`);

        const endTimer = process.hrtime(this._startTimer);
        logger.info(`Execution time: ${endTimer[0] + endTimer[1] / 1E9}s`);
    }

    /* setters and getters */
    set filesIndexed(num)       { this._filesIndexed = num; }
    get filesIndexed()          { return this._filesIndexed; }
    set directoriesIndexed(num) { this._directoriesIndexed = num; }
    get directoriesIndexed()    { return this._directoriesIndexed; }
    set unknownCount(num)       { this._unknownCount = num; }
    get unknownCount()          { return this._unknownCount; }
}
