/** @module libs/db/json */

import fs from "fs";
import logger from "../logging/logger";

/** Class to manage to create debug JSON output instead of sending to a database. */
export default class Json {

    /**
     * Callback to execute after the JSON is written to file.
     *
     * @author Jonathan Tan
     * @callback onFinishCallback
     */

    /**
     *
     * @author Jonathan Tan
     * @param {string} - The file name of the debug output file.
     * @param {onFinishCallback} onFinish - The callback to execute once the JSON is written to file.
     */
    constructor(debugFile, onFinish) {
        this._output = debugFile;
        this._root = null;
        this._objects = {};

        this._finishCallback = onFinish;
    }

    /**
     * Takes in a folder name and returns an object containing the folder's metadata and its children in a nested array.
     *
     * @author Jonathan Tan
     * @returns {Object} An object with the folder's metadata and its children's objects.
     */
    _fillInChildren(folder) {
        // retrieve the data for the folder from the hashtable
        let obj = this._objects[folder];

        // extract the sub-files and sub-folders
        let files = obj.files;
        let folders = obj.folders;

        // remove these lists from the object
        delete obj.files;
        delete obj.folders;

        // add an empty children's array to the object
        obj.children = [];

        // add the data of the sub-folders
        for (let f of folders) {
            obj.children.push(this._fillInChildren(f));
        }

        // add the data of the sub-files
        for (let f of files) {
            obj.children.push(this._objects[f]);
        }

        return obj;
    }

    /**
     * Finalizes the output JSON object and writes it to the file.
     *
     * @author Jonathan Tan
     * @param {boolean} commit - Write the JSON to file.
     */
    close(commit) {
        if (commit && this._root) {
            // build complete JSON output
            let finalJson = this._fillInChildren(this._root);

            // write JSON to file
            fs.writeFile(this._output, JSON.stringify(finalJson, null, 4), (error) => {
                if (error) {
                    logger.info(error);
                } else {
                    this._root = null;
                    this._objects = {};

                    logger.debug("Successfully wrote JSON to file");
                    this._finishCallback();
                }
            });
        } else {
            logger.error("JSON was not written to file");
            this._finishCallback();
        }
    }

    /**
     * Adds a new object or objects to be written to the debug JSON.
     *
     * @author Jonathan Tan
     * @param {Object|Object[]} obj - The object, or an array of objects, to write to JSON.
     */
    addToCollection(obj) {
        for (let item of obj) {
            // select only a few properties
            let parsed = { path: item._id, isFolder: item.isFolder, size: item.size };

            // add children details to folder-type objects
            if (item.isFolder) {
                parsed.files = item.files;
                parsed.folders = item.folders;
            }

            // insert the object into the map
            this._objects[parsed.path] = parsed;

            // keep note if this is the root object
            if (item.parent == null) {
                this._root = parsed.path;
            }
        }
    }

    /* setters and getters */
    set rootDir(rootDir)    { this._root = rootDir; }
    get rootDir()           { return this._root; }
    set database(database)  { this._objects = database; }
    get database()          { return this._objects; }
}
