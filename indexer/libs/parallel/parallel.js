/** @module libs/parallel/parallel */

import cp from "child_process";
import logger from "../logging/logger";
import MinHeap from "./minheap";
import os from "os";
import protocol from "./protocol";

/** Utility to manage worker processes. */
export default class Parallel {
    /**
     * Creates an instance of Parallel.
     * 
     * @author Jonathan Tan
     * @param {string} modulePath - The module to run in the worker process.
     * @param {string[]} args - List of string arguments.
     * @param {number} [maxPoolSize=os.cpus().length-1] - The maximum number of workers that can be in the pool.
     * @param {number} [minPoolSize=1] - The minimum number of workers that should be in the pool.
     */
    constructor(modulePath, args, maxPoolSize = os.cpus().length - 1, minPoolSize = 1) {
        logger.debug("Creating the worker pool...")

        // apply pool size constraints
        this._minPoolSize = (minPoolSize > 0) ? minPoolSize : 1;
        this._maxPoolSize = (maxPoolSize > minPoolSize) ? maxPoolSize : minPoolSize;

        // save the module path and the arguments to pass
        this._forkPath = modulePath;
        this._forkArgs = args;

        // initialize empty list of message handlers
        this._messageHandlers = new Map();

        // create an empty worker pool
        this._workerHash = new Map();
        this._workerHeap = new MinHeap();

        // create input buffer for incoming messages
        this._inputBuffer = Buffer.allocUnsafe(0);

        // start pool with minimum number of workers
        for (let i = 0; i < this._minPoolSize; i++) {
            this._addWorkerToPool();
        }
    }

    /**
     * Adds a new worker process to the worker pool.
     * 
     * @author Jonathan Tan
     */
    _addWorkerToPool() {
        let opts = {
            // pipe fd[3] for output, fd[4] for input
            stdio: [process.stdin, process.stdout, process.stderr, "pipe", "pipe"]
        };

        // create the new worker process
        let newWorker = cp.spawn("node", [this._forkPath].concat(this._forkArgs), opts);

        // upon receiving data in input pipe from worker, process appropriately
        newWorker.stdio[4].on("data", (chunk) => {
            // add received data to a buffer
            this._inputBuffer = Buffer.concat([this._inputBuffer, chunk]);

            // process messages from the workers one-by-one
            let message;
            do {
                // read one object from the buffer
                message = protocol.readObject(this._inputBuffer);

                if (message != null) {
                    // apply handler for each key in returned object
                    for (let key in message) {
                        if (key == "returned") {
                            // check if the worker process has returned completely (i.e. stopped working)
                            if (message[key] == true) {
                                // update job count in the min-heap
                                this._workerHeap.update(newWorker.pid, this._workerHeap.valueOfKey(newWorker.pid) - 1);
                            }
                        } else {
                            // otherwise, use a message handler
                            let handler = this._messageHandlers.get(key);
                            if (handler) {
                                handler(message[key]);
                            } else {
                                logger.debug(`Message handler for ${key} was undefined`);
                            }
                        }
                    }

                    // shrink buffer by one object
                    this._inputBuffer = protocol.removeObject(this._inputBuffer);
                }
            } while (message != null);

            // if none of the workers are working, execute idle callback
            if (this._workerHeap._heap.every((value, index, array) => { return value["value"] == 0; })) {
                if (this._idleCallback) {
                    this._idleCallback();
                }
            }
        });

        // add process to the worker pool
        this._workerHash.set(newWorker.pid, newWorker);
        this._workerHeap.insert(newWorker.pid, 0);
    }

    /**
     * Callback to handle a message that is sent to the master from a worker process.
     * 
     * @author Jonathan Tan
     * @callback messageCallback
     * @param {Object} item
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
     * This method attempts to send the object to the worker that has the least jobs currently assigned to
     * it. If all workers are working, the method will attempt to expand the pool size.
     * 
     * @author Jonathan Tan
     * @param {Object} message - The object to send to the worker.
     */
    sendToWorker(message) {
        // examine the least-busy worker
        let leastBusy = this._workerHeap.peek();

        // if all workers are busy but there's still room in the pool, create a new worker
        if (leastBusy["value"] != 0 && this._workerHash.size < this._maxPoolSize) {
            this._addWorkerToPool();
        }

        // get the least-busy worker
        let worker = this._workerHeap.peek();

        // update job count of the worker
        this._workerHeap.update(worker["key"], worker["value"] + 1);

        // send the object to the worker
        this._workerHash.get(worker["key"]).stdio[3].write(protocol.convertObject(message));
    }

    /**
     * Closes all processes in the worker pool.
     * 
     * @author Jonathan Tan
     */
    closeWorkerPool() {
        logger.debug("Closing the worker pool...")

        // even after all the hard work your workers have done, kill them all
        for (let [pid, worker] of this._workerHash.entries()) {
            worker.kill();
        }

        // reset class variables
        this._messageHandlers = new Map();
        this._workerHash = new Map();
        this._workerHeap = new MinHeap();
        this._inputBuffer = Buffer.allocUnsafe(0);
    }

    /* getters */
    get minPoolSize()   { return this._minPoolSize }
    get maxPoolSize()   { return this._maxPoolSize }
}
