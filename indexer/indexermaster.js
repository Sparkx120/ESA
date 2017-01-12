import args from "./libs/args/argsmaster";
import FileMetrics from "./libs/fileutils/metrics";
import logger from "./libs/logging/logger";
import Mongo from "./libs/mongo/mongo.js";
import Parallel from "./libs/parallel/parallel.js";

// get the command-line arguments
const {root, server, port} = args;

// setup collection name to be the current timestamp
const collection = new Date().toJSON();

// create the profiler for the indexer
const profiler = new FileMetrics();

// create the worker process pool
const workerPool = new Parallel("runworker.js", []);

// add message handlers for the processes
workerPool.addMessageHandler("continue", (item) => {
    // send returned directory list to some other worker process
    workerPool.sendToWorker(item);
});
workerPool.addMessageHandler("process", (item) => {
    // send all directories returned to the database
    mongo.addToCollection(item, collection);
});
workerPool.addMessageHandler("profile", (item) => {
    // accumlate metrics in profiler
    profiler.filesIndexed += item.files;
    profiler.directoriesIndexed += item.dirs;
    profiler.unknownCount += item.unknown;
});

// add idle behaviour to the worker pool
workerPool.onIdle(() => {
    // if worker don't have anything, finish indexer
    logger.info("Indexing complete");

    // close the worker pool
    workerPool.closeWorkerPool();

    // close the database connection
    mongo.close();

    // output profiler metrics
    profiler.logMetrics();
});

// connect to MongoDB database server
const mongo = new Mongo();
mongo.connectTo(server, port, "esa", workerPool.maxPoolSize * 5, () => {
    // send root directory to the process pool
    logger.info(`Starting indexer from root: ${root}`);
    workerPool.sendToWorker([{ parent: null, name: root }]);
}, () => {
    logger.info("Unable to connect to the database server");
    workerPool.closeWorkerPool();
});
