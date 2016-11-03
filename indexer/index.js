import {FileSystemObject} from "./filesystemobject";
import {logger} from "./logger";

// filesystem module
var fs = require("fs");

// arguments module
var argv = require("yargs")
    .usage("Usage: $0 [options]")
    .alias("r", "root")
    .nargs("r", 1)
    .describe("r", "root directory")
    .demand(["r"])
    .argv;

/* read in arguments from command line */
var root = argv.root;

/* BFS-traversal queue */
var queue = []; // keep elements as strings for easy serialization

/* profiling variables */
var filesIndexed = 0;
var directoriesIndexed = 0;
var errors = 0;
var startTimer = process.hrtime();

/* Returns whether or not an array is empty. */
function isEmpty(arr) {
    return typeof arr == "undefined" || arr == null || arr.length == 0;
}

/* Given a pathname, separate the file system objects contained in it into files and directories. */
function split(pathname) {
    var files = [];
    var directories = [];

    try {
        // get the files contained with the directory
        var contained = fs.readdirSync(pathname);

        contained.forEach(function (f) {
            try {
                // create a file system object containing the details of the file
                var fso = FileSystemObject.createFileSystemObject(pathname, f);

                // separate file system objects into lists by whether they are a directory or not
                if (fso.isDirectory) {
                    directories.push(fso);
                } else {
                    files.push(fso);
                }
            } catch (err) {
                errors++;
                logger.error(err.toString());
            }
        });
    } catch (err) {
        errors++;
        logger.error(err.toString());
    }

    return { files: files, directories: directories };
}

/* Dummy function to print out file names. */
function doSomethingWithFiles(files) {
    files.forEach(function (f) {
        logger.debug(f.fullpath);
        filesIndexed++;
    });
}

/* Dummy function to print out directory names. */
function doSomethingWithDirectories(directories) {
    directories.forEach(function (d) {
        logger.debug(d.fullpath);
        directoriesIndexed++;
    });
}

/* Begin the indexer. */
function startIndexer(root) {
    // start by enqueuing the root directory
    logger.info("Starting indexer from root: %s.", root);
    queue.push(root);

    // continue indexing until our traversal queue is empty
    while (!isEmpty(queue)) {
        // peek at the head of our queue to get the next directory to look at
        var head = queue[0];

        // separate files and directories in the directory
        var s = split(head);
        var f = s.files;
        var d = s.directories;

        // for now, do some dummy operation with the files and directories
        doSomethingWithFiles(f);
        doSomethingWithDirectories(d);

        // enqueue all the directories
        d.forEach(function (x) {
            return queue.push(x.fullpath);
        });

        // dequeue the head element of the queue
        queue.shift();
    }

    logger.info("Indexing complete.");
}

startIndexer(root);

logger.debug("# of files indexed: %d", filesIndexed);
logger.debug("# of directories indexed: %d", directoriesIndexed);
logger.debug("# of errors: %d", errors);

var endTimer = process.hrtime(startTimer);
logger.debug("Execution time: %ds", endTimer[0] + endTimer[1] / 1E9);
