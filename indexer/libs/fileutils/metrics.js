/** @module libs/fileutils/metrics */

/** This class is used to keep track of various file-related metrics while processing. */
export default class FileMetrics {

    /**
     * Creates an instance of FileMetrics.
     * 
     * @author Jonathan Tan
     * @param {bunyan.Logger} - The logger object for logging.
     */
    constructor(logger) {
        this._filesIndexed = 0;
        this._directoriesIndexed = 0;
        this._unknownCount = 0;

        this._startTimer = process.hrtime();

        this._logger = logger;
    }

    /**
     * Save the current metrics to the logger.
     * 
     * @author Jonathan Tan
     */
    logMetrics() {
        this._logger.info(`# of files indexed: ${this._filesIndexed}`);
        this._logger.info(`# of directories indexed: ${this._directoriesIndexed}`);
        this._logger.info(`# of unknown files: ${this._unknownCount}`);

        const endTimer = process.hrtime(this._startTimer);
        this._logger.info(`Execution time: ${endTimer[0] + endTimer[1] / 1E9}s`);
    }

    /* setters and getters */
    set filesIndexed(num)       { this._filesIndexed = num; }
    get filesIndexed()          { return this._filesIndexed; }
    set directoriesIndexed(num) { this._directoriesIndexed = num; }
    get directoriesIndexed()    { return this._directoriesIndexed; }
    set unknownCount(num)       { this._unknownCount = num; }
    get unknownCount()          { return this._unknownCount; }
}
