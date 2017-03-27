/** @module libs/db/mongo */

import logger from "../logging/logger";
import mongodb from "mongodb";

/** Class to manage interactions with a MongoDB server. */
export default class Mongo {

    /**
     * Callback to execute upon successfully connecting to the database.
     *
     * @author Jonathan Tan
     * @callback onConnectSuccess
     */

    /**
     * Callback to execute upon failing to connect to the database.
     *
     * @author Jonathan Tan
     * @callback onConnectFail
     */

    /**
     * Callback to execute when the connection to the database is gracefully closed.
     *
     * @author Jonathan Tan
     * @callback onConnectionClose
     */

    /**
     * Attempts to establish a connection with the MongoDB server.
     *
     * @author Jonathan Tan
     * @param {string} server - The database server name.
     * @param {number} port - The port number.
     * @param {string} name - The name of the database.
     * @param {number} poolSize - Number of connections in the connection pool.
     * @param {number} [bufferThreshold=2048] - Maximum length of write operations buffer before sending.
     * @param {onConnectSuccess} onSuccess - The callback to execute if the connection was successfully established.
     * @param {onConnectFail} onFail - The callback to execute if the connection could not be established.
     * @param {onConnectionClose} onExit - The callback to execute when the connection to the database closes.
     */
    constructor(server, port, name, poolSize, bufferThreshold = 2048, onSuccess, onFail, onExit) {
        mongodb.MongoClient.connect(`mongodb://${server}:${port}/${name}`, { server: { poolSize } }, (error, db) => {
            if (error) {
                logger.error(error);
                onFail();
            }

            if (db) {
                logger.debug("Successfully connected to the database");

                this._bufferThreshold = bufferThreshold;
                this._database = db;
                this._writeBuffers = {};
                this._outgoingCount = 0;
                this._readyToClose = false;
                this._closeCallback = onExit;
                onSuccess();
            }
        });
    }

    /**
     * Callback to execute once a buffer has been sent to the database.
     *
     * @author Jonathan Tan
     * @callback bufferSentCallback
     */

    /**
     * Sends all objects in the buffer into the database.
     *
     * @author Jonathan Tan
     * @param {Object[]} buffer - An array of write operations to be send.
     * @param {string} collection - The name of the collection to which to send.
     * @param {bufferSentCallback} callback - Callback to execute once buffer has been sent.
     */
    _sendBufferToDatabase(buffer, collection, callback) {
        if (buffer.length != 0) {
            this._outgoingCount++;
            this._database.collection(collection).bulkWrite(buffer, { ordered: false }, (error, result) => {
                if (error) {
                    logger.info(error);
                }
                this._outgoingCount--;

                // execute callback once write completes
                callback();

                // check if user has signaled the connection to be closed once all outgoing calls return
                if (this._outgoingCount == 0 && this._readyToClose == true) {
                    this._closeConnectionToDatabase();
                }
            });
        } else {
            // execute callback as buffer is empty
            callback();
        }
    }

    /**
     * Callback to execute once all buffers are sent to the database.
     *
     * @author Jonathan Tan
     * @callback buffersFlushedCallback
     */

    /**
     * Sends all objects in all buffers to the database.
     *
     * @author Jonathan Tan
     * @param {buffersFlushedCallback} callback - Callback to execute once all buffers have been sent.
     */
    _sendAllBuffersToDatabase(callback) {
        let numBuffers = Object.keys(this._writeBuffers).length;

        if (numBuffers == 0) {
            // execute callback as there are no buffers to flush
            callback();

            // check if user has signaled the connection to be closed once all outgoing calls return
            if (this._outgoingCount == 0 && this._readyToClose == true) {
                this._closeConnectionToDatabase();
            }
        } else {
            for (let b in this._writeBuffers) {
                if (this._writeBuffers.hasOwnProperty(b)) {
                    // send the buffer to the database
                    this._sendBufferToDatabase(this._writeBuffers[b], b, () => {
                        numBuffers--;

                        // execute callback once all buffers are sent to the server
                        if (numBuffers == 0) {
                            callback();
                        }
                    });

                    // set the buffer to be empty
                    this._writeBuffers[b] = [];
                }
            }
        }
    }

    /**
     * Closes the connection to the database and executes the closing callback.
     *
     * @author Jonathan Tan
     */
    _closeConnectionToDatabase() {
        // closes the connection to the database
        this._database.close(() => {
            logger.debug("Successfully closed the connection to the database");

            // execute a closing callback if one is set
            if (this._closeCallback) {
                this._closeCallback();
            }
        });
        this._database = null;
    }

    /**
     * Flushes all buffers and closes the conection once all outgoing calls return.
     *
     * @author Jonathan Tan
     * @param {boolean} commit - Unused.
     */
    close(commit) {
        if (this._database) {
            // flush all buffers
            this._sendAllBuffersToDatabase(() => {
                // signal that the connection is waiting to be closed
                this._readyToClose = true;
                logger.debug("Closing connection to the database");
            });
            this._writeBuffers = {};
        } else {
            logger.warn("Warning: There is no open connection to the database to close");
        }
    }

    /**
     * Buffers a write operation to be sent to the database. Will only send the objects to the database if buffer exceeds a threshold.
     *
     * @author Jonathan Tan
     * @param {Object} op - The write operation.
     * @param {string} collection - The name of the collection to which to write.
     */
    _writeToCollection(op, collection) {
        // adds the write operation to the appropriate buffer
        if (this._writeBuffers.hasOwnProperty(collection)) {
            this._writeBuffers[collection].push(op);
        } else {
            this._writeBuffers[collection] = [op];
        }

        // flush buffer if it has exceeded the threshold
        if (this._writeBuffers[collection].length >= this._bufferThreshold) {
            logger.trace(`Flushing buffer ${collection} of size ${this._writeBuffers[collection].length}`);
            this._sendBufferToDatabase(this._writeBuffers[collection], collection, () => { });
            this._writeBuffers[collection] = [];
        }
    }

    /**
     * Buffers a new object or objects to be added to the database.
     *
     * @author Jonathan Tan
     * @param {Object|Object[]} obj - The object, or an array of objects, to send to the database. The function assumes that objects are well-formatted.
     * @param {string} collection - The name of the collection into which to add.
     */
    addToCollection(obj, collection) {
        if (this._database === undefined || this._database == null) {
            logger.warn("Warning: Attempted to add to uninitialized database");
        } else {
            for (let doc of obj) {
                // add a single insert operation to the queue
                this._writeToCollection({ insertOne: { document: doc } }, collection);
            }
        }
    }

    /**
     * Buffers an update operation to be issued to the database.
     *
     * @author Jonathan Tan
     * @param {Object} filter - The filter used to select the document to update. The function assumes that it is well-formatted.
     * @param {Object} update - The update operations to be applied to the document. The function assumes that it is well-formatted.
     * @param {string} collection - The name of the collection into which to add.
     */
    updateInCollection(filter, update, collection) {
        if (this._database === undefined || this._database == null) {
            logger.warn("Warning: Attempted to add to uninitialized database");
        } else {
            // add a single udpate operation to the queue
            this._writeToCollection({ updateOne: { filter: filter, update: update } }, collection);
        }
    }
}
