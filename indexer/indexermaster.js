import amqp from "amqplib/callback_api";
import args from "./libs/args/argsmaster";
import crypto from "crypto";
import FileMetrics from "./libs/fileutils/metrics";
import Json from "./libs/db/json.js";
import logger from "./libs/logging/logger";
import Mongo from "./libs/db/mongo.js";
import os from "os";
import Parallel from "./libs/parallel/parallel.js";
import path from "path";
import readline from "readline";

const CIPHER_PASS = "4jesa_secure_password";

// on Windows, must use the readline module to catch signals
if (process.platform === "win32") {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on("SIGINT", () => {
        process.emit("SIGINT");
    });
}

// catch Ctrl+C SIGINT signal
let stopFlag = false;
let savedContinue = [];
process.on("SIGINT", () => {
    if (!stopFlag) {
        stopFlag = true;
        logger.info("Stopping now...");
    }
});

// get the command-line arguments
let { root_dir, contd, server, port, rabbitmq, buffer_threshold, debug, verbose } = args;

// if the user provide a Windows drive as root as "C:" or such, then fix it to "C:\"
if (root_dir) {
    let driveFix = root_dir.match(/([A-Z]):\./i);
    if (driveFix) {
        root_dir = driveFix[1] + ":\\";
    }
}

let collection;
let ciphered_collection;
let isResuming;
if (contd) {
    isResuming = true;

    // record ciphered collection name
    ciphered_collection = contd;

    // derive collection name from argument key
    let decipher = crypto.createDecipher("aes192", CIPHER_PASS);
    collection = decipher.update(ciphered_collection, "hex", "utf8");
    collection += decipher.final("utf8");
} else {
    isResuming = false;

    // setup collection name to be hostname, plus the current timestamp
    collection = `${os.hostname()} (${new Date().toJSON()})`;

    // derive collection name from argument key
    let cipher = crypto.createCipher("aes192", CIPHER_PASS);
    ciphered_collection = cipher.update(collection, "utf8", "hex");
    ciphered_collection += cipher.final("hex");
}

// create the profiler for the indexer
let profiler = new FileMetrics();

// create an intervale that outputs indexing progress every second if verbose mode, five seconds otherwise
let isIndexing = false;
setInterval(() => {
    if (isIndexing) {
        logger.info(`Indexing... (Progress: ${profiler.filesIndexed} files, ${profiler.directoriesIndexed} directories, ${profiler.unknownCount} unknown)`);
    }
}, (verbose) ? 1000 : 5000);

// create a map to accumulate folders while indexing
let foldersMap = {};

// we'll create as many workers as we have processing units, minus one for the master process
const numWorkers = os.cpus().length - 1;

// start of program execution by creating/reading from save queue
handleResumable();

let saveQueue;
let saveChannel;
let resumeInfo;
let resumingJson;

/**
 * Setups a save queue to be used for resuming, or retrieves saved data from queue in the case of resuming.
 *
 * @author Jonathan Tan
 */
function handleResumable() {
    logger.debug("Connecting to RabbitMQ server");
    amqp.connect(`amqp://${rabbitmq}`, (err, conn) => {
        if (err) {
            // can't connect, terminate
            logger.fatal("Unable to connect to RabbitMQ server");
            process.exit(1);
        }

        conn.createConfirmChannel((err, channel) => {
            if (err) {
                // can't create channel, terminate
                logger.fatal("Unable to create RabbitMQ channel");
                process.exit(1);
            }

            saveChannel = channel;

            if (isResuming) {
                saveChannel.checkQueue(ciphered_collection.concat("_S"), (err, ok) => {
                    if (err) {
                        // no such save queue, terminate
                        logger.fatal(`Unable to resume indexing with key ${ciphered_collection}`);
                        logger.fatal("Ensure that the key is typed correctly");
                        process.exit(1);
                    }

                    // save the reference to the queue's name
                    saveQueue = ok.queue;

                    // retrieve saved data from queue
                    logger.debug("Reading saved state from save queue");
                    saveChannel.get(saveQueue.queue, { durable: false }, (err, msgOrFalse) => {
                        if (err || msgOrFalse == false) {
                            // unable to retrieve save data, terminate
                            logger.fatal(`Unable to resume indexing with key ${ciphered_collection}`);
                            process.exit(1);
                        }

                        // parse the stored save data
                        resumeInfo = JSON.parse(msgOrFalse.content);
                        logger.debug("Restoring saved state");

                        // load back command-line arguments
                        root_dir = resumeInfo.args.root;
                        server = resumeInfo.args.server;
                        port = resumeInfo.args.port;
                        buffer_threshold = resumeInfo.args.buffer;
                        debug = (resumeInfo.args.debug === "." ? undefined : resumeInfo.args.debug);
                        verbose = resumeInfo.args.verbose;

                        // load back file size map
                        foldersMap = resumeInfo.filesizes;

                        // restore previous debug output state
                        resumingJson = resumeInfo.debug;

                        // restore previous profiler state
                        profiler = new FileMetrics(resumeInfo.profiler.files, resumeInfo.profiler.directories, resumeInfo.profiler.unknown);

                        // acknowledge the message
                        channel.ack(msgOrFalse);

                        // connect to the database
                        connectToDatabase();
                    });
                });
            } else {
                logger.debug("Creating save queue in RabbitMQ");
                saveChannel.assertQueue(ciphered_collection.concat("_S"), {}, (err, ok) => {
                    // save the reference to the queue's name
                    saveQueue = ok.queue;

                    // connect to the database
                    connectToDatabase();
                });
            }
        });
    });
}

let db;

/**
 * Connects to the appropriate database.
 *
 * @author Jonathan Tan
 */
function connectToDatabase() {
    if (debug) {
        // debug output
        db = new Json(path.normalize(debug), () => {
            if (!stopFlag) {
                // output profiler metrics
                profiler.logMetrics();
            }

            // terminate program
            process.exit();
        }, resumingJson);

        // restore previous state of debug database
        if (contd) {
            db.rootDir = root_dir;
            db.database = resumingJson;
        }

        createParallelWorkerPool();
    } else {
        // database output
        db = new Mongo(server, port, "esa", numWorkers * 5, buffer_threshold, createParallelWorkerPool, () => {
            // failure to connect, close worker pool
            logger.info("Unable to connect to the database server");
            process.exit(1);
        }, () => {
            if (!stopFlag) {
                // output profiler metrics
                profiler.logMetrics();
            }

            // terminate program
            process.exit();
        });
    }
}

let workerPool;

/**
 * Creates the parallel worker pool and configures it.
 *
 * @author Jonathan Tan
 */
function createParallelWorkerPool() {
    // create the worker process pool
    workerPool = new Parallel("runworker.js", ["--verbose", verbose, "--rabbitmq", rabbitmq], numWorkers, ciphered_collection, rabbitmq, !isResuming, startIndexer, onParallelFail);
    setupWorkerPool();
}

/**
 * Setups worker pool message and idle handlers. It then initializes the worker pool.
 *
 * @author Jonathan Tan
 */
function setupWorkerPool() {
    logger.debug("Setting up the worker pool");

    // add message handlers for the worker processes
    workerPool.addMessageHandler("continue", (item) => {
        if (!stopFlag) {
            // send returned directory list to some other worker process
            workerPool.sendToWorker(item);
        } else {
            savedContinue.push(item);
        }
    });
    workerPool.addMessageHandler("process", (item) => {
        // get the folders which were processed in this batch
        let foldersInItem = item.filter((x) => { return x.isFolder });

        // update folder sizes in aggregate map
        for (let folder of foldersInItem) {
            // add the the sizes of the files
            let filesSize = item.filter((x) => { return x.parent === folder._id; }).reduce((acc, cur) => { return acc + cur.size; }, 0);
            folder.size = filesSize;

            // add folder to the hash
            foldersMap[folder._id] = folder;

            // update file size of parent folder and bubble up to root
            let currentFolder = folder.parent;
            while (currentFolder != null) {
                foldersMap[currentFolder].size += filesSize;
                currentFolder = foldersMap[currentFolder].parent;
            }
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

    // add idle behaviour to the worker pool
    workerPool.onIdle(() => {
        if (!stopFlag) {
            // if workers don't have anything to do, finish indexer
            isIndexing = false;
            logger.info("Indexing complete");

            // close the worker pool
            workerPool.closeWorkerPool(true, () => {
                // send all the folders to the database
                logger.info("Sending folders to database");
                db.addToCollection(Object.keys(foldersMap).map((v) => { return foldersMap[v]; }), collection);

                // add a completion timestamp on root object
                if (!debug) {
                    db.updateInCollection({ parent: null }, { $currentDate: { completed: true } }, collection);
                }

                // delete the save queue as we have terminated cleanly
                saveChannel.deleteQueue(saveQueue, {}, (err, ok) => {
                    // close the database connection
                    db.close(true);
                });
            });
        } else {
            workerPool.closeWorkerPool(false, onParallelFail);
        }
    });

    if (contd) {
        // identify the length of the worker queue
        workerPool.numJobs = resumeInfo.workerLength;
    }

    // intialize the worker pool and start the indexer, hopefully
    workerPool.intializeWorkerPool();
}

/**
 * Callback to execute if the parallel worker pool has terminated early.
 *
 * @author Jonathan Tan
 */
function onParallelFail() {
    // fill reply with remaining objects
    for (let item of savedContinue) {
        workerPool.sendToWorker(item);
    }

    // record necessary resume information in save queue
    let saveData = {
        args,
        filesizes: foldersMap,
        workerLength: savedContinue.length,
        profiler: {
            files: profiler.filesIndexed,
            directories: profiler.directoriesIndexed,
            unknown: profiler.unknownCount
        }
    };
    if (debug) {
        saveData.debug = db.database;
    }

    // store save data in a message queue
    saveChannel.sendToQueue(saveQueue, new Buffer(JSON.stringify(saveData)), {}, (err, ok) => {
        // notify user on how to resume indexer
        logger.info(`To resume the indexer, use ${args.$0} -c ${ciphered_collection}`);

        // close the database connection
        if (db) {
            db.close(false);
        }

        // stop the process with error code
        process.exit(1);
    });
}

/**
 * Start the indexer by sending the root directory to the workers, if not resuming.
 *
 * @author Jonathan Tan
 */
function startIndexer() {
    if (!contd) {
        // send root directory to the process pool
        logger.info(`Starting indexer from root: ${root_dir}`);
        workerPool.sendToWorker([{ parent: null, name: root_dir }]);

        isIndexing = true;
    }
}
