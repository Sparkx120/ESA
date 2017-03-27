/** @module libs/parallel/parallel */

import amqp from "amqplib/callback_api";
import cp from "child_process";
import logger from "../logging/logger";
import readline from "readline";

/** Utility to manage worker processes. */
export default class Parallel {

    /**
     * Callback to execute once the parallelization is ready to use.
     *
     * @author Jonathan Tan
     * @callback readyCallback
     */

    /**
     * Callback to execute if parallelization must terminate abnormally.
     *
     * @author Jonathan Tan
     * @callback failCallback
     */

    /**
     * Creates an instance of Parallel.
     *
     * @author Jonathan Tan
     * @param {string} modulePath - The module to run in the worker process.
     * @param {string[]} args - List of string arguments.
     * @param {number} poolSize - The number of workers that should be in the pool.
     * @param {string} id - A unique identification string for this instance.
     * @param {string} server - The hostname for the RabbitMQ server.
     * @param {boolean} isNew - Whether a new queue should be created or whether an existing should be used.
     * @param {readyCallback} readyCallback - The callback to execute once setup is complete.
     * @param {failCallback} failCallback - The callback to execute if the worker pool must terminate abnormally.
     */
    constructor(modulePath, args, poolSize, id, server, isNew, readyCallback, failCallback) {
        logger.debug("Initializing the worker pool");
        this._poolSize = Math.max(poolSize, 1);
        this._name = id;
        this._hostname = server;
        this._isNew = isNew;

        // worker pool variables
        this._workerPool = [];
        this._readyWorkers = 0;
        this._numJobs = 0;
        this._currentRetries = 0;
        this._maxRetries = 0;

        // save callback functions
        this._readyCallback = readyCallback;
        this._failCallback = failCallback;

        // save the module path and the arguments to pass
        this._forkPath = modulePath;
        this._forkArgs = args;

        // initialize empty list of message handlers
        this._messageHandlers = new Map();
    }

    /**
     * Adds a new worker process to the worker pool.
     *
     * @author Jonathan Tan
     */
    _addWorkerToPool() {
        // create the new worker process
        let newWorker = cp.spawn("node", [this._forkPath, "-n", this._name.concat("_W")].concat(this._forkArgs));

        // re-route worker stdout to logger.debug
        readline.createInterface({ input: newWorker.stdout }).on("line", (input) => {
            // wonky process for waiting for process to finish setup
            if (input === this._name.concat("_W")) {
                this._readyWorkers++;

                if (this._readyWorkers == this._poolSize) {
                    // execute callback when everything is setup
                    this._readyCallback();
                }
            } else {
                logger.debug(input);
            }
        });

        // re-route worker stderr to logger.error
        readline.createInterface({ input: newWorker.stderr }).on("line", (input) => {
            logger.error(input);
        });

        // handle worker process crashes/failures
        newWorker.on("exit", (code) => {
            // only process erroneous exits
            if (code) {
                logger.debug(`Process ${newWorker.pid} has died`);

                // assume the job has been lost
                this._numJobs--;

                if (this._currentRetries <= this._maxRetries) {
                    if (this._currentRetries == this._maxRetries) {
                        // too many failures, so shut down program
                        this._currentRetries++;
                        logger.fatal("Worker processes have failed too many times. Shutting down...");
                        this.closeWorkerPool(false, () => {
                            // call early termination callback
                            this._failCallback();
                        });
                    } else {
                        // try to create a new worker and retry
                        this._currentRetries++;
                        logger.debug(`Spawning a new process...`);
                        this._addWorkerToPool();
                    }
                }
            }
        });

        // add worker to worker pool
        this._workerPool.push(newWorker);
        logger.debug(`Spawned new worker with pid ${newWorker.pid}`);
    }

    /**
     * Parses a message returned from a worker process and apply handlers to the objects returned.
     *
     * @author Jonathan Tan
     * @param {amqp.Message} message - The message to parse.
     */
    _parseWorkerMessage(message) {
        if (message) {
            // retrieve the object that was sent back
            let reply = JSON.parse(message.content.toString());

            // apply handler for each key in returned object
            for (let key in reply) {
                if (key === "_returned" && reply["_returned"]) {
                    // special key to know when a worker is done working
                    this._numJobs--;
                } else {
                    // use a message handler to process each returned object
                    let handler = this._messageHandlers.get(key);
                    if (handler) {
                        handler(reply[key]);
                    }
                }
            }

            // if there are no jobs in progress, then call idle function
            if (this._numJobs == 0) {
                this._idleCallback();
            }
        }
    }

    /**
     * Setups the message queues and spawns the worker processes.
     *
     * @author Jonathan Tan
     */
    intializeWorkerPool() {
        // connect to local RabbitMQ server
        amqp.connect(`amqp://${this._hostname}`, (err, conn) => {
            if (err) {
                // can't connect, call fail callback
                this._failCallback();
            } else {
                // create a new protocol channel
                conn.createConfirmChannel((err, channel) => {
                    this._channel = channel;

                    if (this._isNew) {
                        // create a new queue for receiving messages from workers
                        logger.debug("Creating master queue");
                        channel.assertQueue(this._name.concat("_M"), { durable: false }, (err, ok) => {
                            this._replyQueue = ok;

                            // process returned messages
                            channel.consume(ok.queue, (msg) => { this._parseWorkerMessage(msg); }, { noAck: true });

                            // start pool with minimum number of workers
                            logger.debug("Adding workers to pool");
                            for (let i = 0; i < this._poolSize; i++) {
                                this._addWorkerToPool();
                            }
                        });
                    } else {
                        // check for a prexisting queue
                        logger.debug("Checking for master queue");
                        channel.checkQueue(this._name.concat("_M"), (err, ok) => {
                            if (ok) {
                                this._replyQueue = ok;

                                // process returned messages
                                channel.consume(ok.queue, (msg) => { this._parseWorkerMessage(msg); }, { noAck: true });

                                // start pool with minimum number of workers
                                logger.debug("Adding workers to pool");
                                for (let i = 0; i < this._poolSize; i++) {
                                    this._addWorkerToPool();
                                }
                            }
                        });
                    }
                });
            }
        });
    }

    /**
     * Callback to handle a message that is sent to the master from a worker process.
     *
     * @author Jonathan Tan
     * @callback messageCallback
     * @param {Object} item - The object that was sent from the worker to this handler.
     */

    /**
     * Adds a new message handler to the worker pool.
     *
     * Workers will return objects and this class will attempt to execute handlers for each key returned.
     * Calling this method with the same key parameter multiple times will only result the most recent handler passed
     * being used.
     *
     * @author Jonathan Tan
     * @param {string} key - An indentifier for the message handler.
     * @param {messageCallback} handler - The message handler.
     */
    addMessageHandler(key, handler) {
        this._messageHandlers.set(key, handler);
    }

    /**
     * Callback to execute when the worker pool is idle.
     *
     * @author Jonathan Tan
     * @callback onIdleCallback
     */

    /**
     * Sets an optional callback to be called when the worker pool is idle.
     *
     * The check for idle is performed after a worker process completes a job.
     *
     * @author Jonathan Tan
     * @param {onIdleCallback} callback - The callback to execute when the worker pool is idle.
     */
    onIdle(callback) {
        this._idleCallback = callback;
    }

    /**
     * Sends an object to a worker process.
     *
     * @author Jonathan Tan
     * @param {Object} message - The object to send to the worker.
     */
    sendToWorker(message) {
        this._numJobs++;
        this._channel.sendToQueue(this._name.concat("_W"), new Buffer(JSON.stringify(message)), { replyTo: this._replyQueue.queue }, (err, ok) => {
            if (err) {
                this._failCallback();
                this._numJobs--;
            }
        });
    }

    /**
     * Callback to execute once the worker pool has closed completely.
     *
     * @author Jonathan Tan
     * @callback closedCallback
     */

    /**
     * Closes all processes in the worker pool.
     *
     * @author Jonathan Tan
     * @param {boolean} deleteQueue - Whether to delete the queues associated with this Parallel instance.
     * @param {closedCallback} closedCallback - Callback to execute once the worker pool has closed completely.
     */
    closeWorkerPool(deleteQueue, closedCallback) {
        if (deleteQueue) {
            // delete the master queue
            this._channel.deleteQueue(this._name.concat("_M"), {}, (err, ok) => {
                // delete the worker queue
                this._channel.deleteQueue(this._name.concat("_W"), {}, (err, ok) => {
                    // even after all the hard work your workers have done, kill them all
                    logger.debug("Closing the worker pool");
                    for (let worker of this._workerPool) {
                        worker.kill();
                    }

                    closedCallback();
                });
            });
        } else {
            // even after all the hard work your workers have done, kill them all
            logger.debug("Closing the worker pool");
            for (let worker of this._workerPool) {
                worker.kill();
            }

            closedCallback();
        }
    }

    /* setters */
    set numJobs(numJobs) { this._numJobs = numJobs; }
}
