import args from "./libs/args/argsmaster";
import FileMetrics from "./libs/fileutils/metrics";
import Json from "./libs/db/json.js";
import Logger from "./libs/logging/logger";
import Mongo from "./libs/db/mongo.js";
import Parallel from "./libs/parallel/parallel.js";

// get the command-line arguments
const {root, server, port, buffer, debug, verbose} = args;

// create the logger
const logger = new Logger(verbose).createLogger();

// setup collection name to be the current timestamp
const collection = new Date().toJSON();

// create the profiler for the indexer
const profiler = new FileMetrics(logger);

// create a map to accumulate file sizes
const fileSizeMap = new Map();

// create the worker process pool
const workerPool = new Parallel("runworker.js", ["--verbose", verbose], logger);

// add message handlers for the processes
workerPool.addMessageHandler("continue", (item) => {
    // send returned directory list to some other worker process
    workerPool.sendToWorker(item);
});
workerPool.addMessageHandler("process", (item) => {
    // get the folders which were processed in this batch
    let foldersInItem = item.filter((x) => { return x.isFolder });

    // update folder sizes in aggregate map
    for (let folder of foldersInItem) {
        // add the folder with a size of 0 to the aggregate map
        fileSizeMap.set(folder._id, { size: 0, parent: folder.parent, fso: folder });

        // add the the sizes of the files
        let filesSize = item.filter((x) => { return x.parent === folder._id; }).reduce((acc, cur) => { return acc + cur.size; }, 0);

        // update file size of parent folder and bubble up to root
        let currentFolder = folder._id;
        do {
            fileSizeMap.get(currentFolder).size += filesSize;
            currentFolder = fileSizeMap.get(currentFolder).parent;
        } while (currentFolder != null);
    }

    // send only files returned to the database
    db.addToCollection(item.filter((x) => { return !x.isFolder }), collection);
});
workerPool.addMessageHandler("profile", (item) => {
    // accumlate metrics in profiler
    profiler.filesIndexed += item.files;
    profiler.directoriesIndexed += item.dirs;
    profiler.unknownCount += item.unknown;
});
workerPool.addMessageHandler("log", (item) => {
    // log item from worker process
    logger.debug(item);
});

// add idle behaviour to the worker pool
workerPool.onIdle(() => {
    // if workers don't have anything to do, finish indexer
    logger.info("Indexing complete");

    // close the worker pool
    workerPool.closeWorkerPool();

    // update folder sizes in aggregate map
    logger.info("Aggregating folder sizes");
    for (let acc of fileSizeMap.values()) {
        acc.fso.size = acc.size;
    }

    // send all the folders to the database
    db.addToCollection(Array.from(fileSizeMap.values(), (v) => { return v.fso; }), collection);
    logger.info("Aggregation complete");

    // close the database connection
    db.close();
});

// start the indexer
let db;
if (debug) {
    // debug output
    db = new Json(debug, logger, () => {
        // output profiler metrics
        profiler.logMetrics();
    });

    // send root directory to the process pool
    logger.info(`Starting indexer from root: ${root}`);
    workerPool.sendToWorker([{ parent: null, name: root }]);
} else {
    // database output
    db = new Mongo(server, port, "esa", workerPool.maxPoolSize * 5, buffer, logger, () => {
        // send root directory to the process pool
        logger.info(`Starting indexer from root: ${root}`);
        workerPool.sendToWorker([{ parent: null, name: root }]);
    }, () => {
        logger.info("Unable to connect to the database server");
        workerPool.closeWorkerPool();
    }, () => {
        // output profiler metrics
        profiler.logMetrics();
    });
}
