// general modules
import * as util from "./libs/util/util";
import {FileMetrics} from "./libs/util/metrics";

// logging module
import {logger} from "./libs/logging/logger";

// file system object representation
import {FileSystemObject} from "./libs/fileutils/filesystemobject";

// command-line arguments
import {root} from "./libs/args/args";

/* profiling tool */
let profiler = new FileMetrics();

/* BFS-traversal queue */
let queue = []; // keep elements as strings for easy serialization

/* Dummy function to print out file names. */
function doSomethingWithFiles(files) {
    for (let f of files) {
        logger.debug(f.fullpath);
        profiler.filesIndexed++;
    }
}

/* Dummy function to print out directory names. */
function doSomethingWithDirectories(directories) {
    for (let d of directories) {
        logger.debug(d.fullpath);
        profiler.directoriesIndexed++;
    }
}

/* Begin the indexer. */
function startIndexer(root) {
    // start by enqueuing the root directory
    logger.info("Starting indexer from root: %s.", root);
    queue.push(root);

    // continue indexing until our traversal queue is empty
    while (!util.isEmpty(queue)) {
        // peek at the head of our queue to get the next directory to look at
        let head = queue[0];

        // separate files and directories in the directory
        let s = FileSystemObject.splitIntoFilesAndDirectories(head);
        let f = s.files;
        let d = s.directories;
        profiler.errors += s.errorCount;

        // for now, do some dummy operation with the files and directories
        doSomethingWithFiles(f);
        doSomethingWithDirectories(d);

        // enqueue all the directories
        d.forEach(x => queue.push(x.fullpath));

        // dequeue the head element of the queue
        queue.shift();
    }

    logger.info("Indexing complete.");
}

startIndexer(root);

profiler.logMetrics();
