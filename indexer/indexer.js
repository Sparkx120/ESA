// general modules
import * as  util from "./libs/util/util";
import {FileMetrics} from "./libs/util/metrics";

// logging module
import logger from "./libs/logging/logger";

// file system object representation
import {FileSystemObject} from "./libs/fileutils/filesystemobject";

// database module
import Mongo from "./libs/mongo/mongo.js";
const mongo = new Mongo();

// command-line arguments
import args from "./libs/args/args";
const {root, server, port} = args;

/* profiling tool */
const profiler = new FileMetrics();

/* Add a single file system object to the database. */
function addFSOToDatabase(col, parent, dirFso) {
    // get the representation as an object
    let asObj = dirFso.toObject();

    // add the parent to the object
    asObj.parent = parent;

    // send the object to the databse to add
    mongo.addToCollection(asObj, col);
}

/* Begin the indexer. */
function startIndexer(root) {
    // create the BFS-traversal queue
    let queue = []; // keep elements as parent-name pairs

    // establish the name of a new collection in the database for the indexing
    let collectionName = new Date().toJSON();

    // enqueue the root directory
    logger.info("Starting indexer from root: %s.", root);
    queue.push({ parent: null, name: root });

    // continue indexing until our traversal queue is empty
    while (!util.isEmpty(queue)) {
        // peek at the head of our queue to get the next object to look at
        let head = queue[0];

        // create a representation of the object
        let ret = FileSystemObject.createFileSystemObject(head.name);
        let fso = ret.fso;
        profiler.unknownCount += ret.unknown;

        if (fso != null) {
            // add the object to database
            addFSOToDatabase(collectionName, head.parent, fso);

            // for each file in this directory...
            if (!fso.isDirectory) {
                // should only happen if root was a file; then, do nothing else
                profiler.filesIndexed++;
            } else if (fso.isSymLink) {
                // if it's a symbolic link, then count it as a directory, but don't go into it
                profiler.directoriesIndexed++;
            } else {
                // it was a directory
                profiler.directoriesIndexed++;

                // otherwise, for each file in the directory...
                for (let f of fso.files) {
                    // create the representation of the file
                    let fileRet = FileSystemObject.createFileSystemObject(f);
                    let fileFso = fileRet.fso;
                    profiler.unknownCount += fileRet.unknown;

                    // add the file to database
                    if (fileFso != null) {
                        addFSOToDatabase(collectionName, head.name, fileFso);
                        profiler.filesIndexed++;
                    }
                }

                // enqueue all the directories with their parent's name to the queue
                for (let x of fso.folders) {
                    queue.push({ parent: head.name, name: x });
                }
            }
        }

        // dequeue the head element of the queue
        queue.shift();

        // finish processing folder
        logger.debug(`Processed ${head.name}.`);
    }

    logger.info("Indexing complete.");
}

/* connect to database and execute indexer */
mongo.connectTo(server, port, "esa", () => {
    startIndexer(root);
    profiler.logMetrics();
    mongo.close();
});
