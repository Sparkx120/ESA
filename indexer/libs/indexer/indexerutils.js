/** @module libs/indexer/indexerutils */

import FileSystemObject from "../fileutils/filesystemobject";

export default {

    /**
     * Information that can be combined to form a directory's path.
     *
     * @author Jonathan Tan
     * @typedef {Object} DirectoryInfo
     * @property {string} parent - The parent of the directory.
     * @property {string} name - The file name of the directory.
     */

    /**
     * The result of processing a directory.
     *
     * @author Jonathan Tan
     * @typedef {Object} ProcessInfo
     * @property {Object[]} toProcess - The directory and its files as objects to be sent to the database.
     * @property {DirectoryInfo[]} toContinue - The direct sub-directories of the directory.
     * @property {number} filesProcessed - The number of files that were processed.
     * @property {number} dirsProcessed - The number of directories that were processed.
     * @property {number} unknownSeen - The number of files and directories that that were unable to processed.
     */

    /**
     * Processes a directory and its direct children through a database callback.
     *
     * @author Jonathan Tan
     * @param {DirectoryInfo} dirInfo - The file system object to process.
     * @returns {ProcessInfo} The result of processing the directory.
     */
    processDirectory(dirInfo) {
        // list of file system objects to be sent to the database
        let processed = [];

        // list of children directories with which to continue indexing
        let continueQ = [];

        // initialize counters for file system objects
        let numFiles = 0;
        let numDirs = 0;
        let numUnknown = 0;

        // create a representation of the object
        let ret = FileSystemObject.createFileSystemObject(dirInfo.name);
        let fso = ret.fso;
        numUnknown += ret.unknown;

        if (fso != null) {
            // for each file in this directory...
            if (!fso.isDirectory) {
                // should only happen if root was a file; then, do nothing else
                numFiles++;
            } else if (fso.isSymLink) {
                // if it's a symbolic link, then count it as a directory, but don't go into it
                numDirs++;
            } else {
                // it was a directory
                numDirs++;

                // otherwise, for each file in the directory...
                for (let f of fso.files) {
                    // create the representation of the file
                    let fileRet = FileSystemObject.createFileSystemObject(f);
                    let fileFso = fileRet.fso;
                    numUnknown += fileRet.unknown;

                    // add the file to processed list
                    if (fileFso != null) {
                        // add the additional fields to file system object
                        let fileFsoAsObj = fileFso.toObject();
                        fileFsoAsObj.parent = fso.name;
                        fileFsoAsObj.fileCount = 0;
                        fileFsoAsObj.dirsCount = 0;

                        // push file system object to process list
                        processed.push(fileFsoAsObj);
                    }
                }
                numFiles += processed.length;

                // enqueue all the directories with their parent's name to the return queue
                for (let subDir of fso.folders) {
                    continueQ.push({ parent: fso.name, name: subDir });
                }
            }

            // add the additional fields to file system object
            let fsoAsObj = fso.toObject();
            fsoAsObj.parent = dirInfo.parent;
            fsoAsObj.fileCount = (fso.isDirectory ? fso.files.length : 0);
            fsoAsObj.dirsCount = (fso.isDirectory ? fso.folders.length : 0);

            // push file system object to process list
            processed.push(fsoAsObj);
        }

        // return information about the directory
        return {
            toProcess: processed,
            toContinue: continueQ,
            filesProcessed: numFiles,
            dirsProcessed: numDirs,
            unknownSeen: numUnknown
        };
    }
}
