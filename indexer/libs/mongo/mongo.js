/** @module libs/mongo/mongo */

import logger from "../logging/logger";
import mongodb from "mongodb";

/** @constant {number} */
const BUFFER_THRESHOLD = 2048;

/** Helper class to count the number of outgoing MongoDB calls. */
class MongoCount {

    /**
     * Creates an instance of MongoCount.
     * 
     * @author Jonathan Tan
     */
    constructor() {
        this._outgoingCount = 0;
        this._readyToClose = false;
    }

    /* setters and getters */
    set outgoingCount(value)    { this._outgoingCount = value; }
    get outgoingCount()         { return this._outgoingCount; }
    set readyToClose(value)     { this._readyToClose = value; }
    get readyToClose()          { return this._readyToClose; }
}

/**
 * Closes the connection to the database if appropriate.
 * 
 * @author Jonathan Tan
 * @param {mongodb.Db} database - The database instance.
 * @param {MongoCount} mongoCounter - A counter to keep track of outgoing database calls.
 */
function checkReadyToClose(database, mongoCounter) {
    if (mongoCounter.readyToClose && mongoCounter.outgoingCount == 0) {
        database.close();
        database = null;
        logger.debug("Closed connection to the database.");
    }
}

/**
 * Inserts all objects in the buffer into the database.
 * 
 * @author Jonathan Tan
 * @param {Object[]} buffer - An array of objects to be inserted.
 * @param {string} collection - The name of the collection into which to insert.
 * @param {mongodb.Db} database - The database instance.
 * @param {MongoCount} mongoCounter - A counter to keep track of outgoing database calls.
 */
function sendBufferToDatabase(buffer, collection, database, mongoCounter) {
    if (buffer.length != 0) {
        mongoCounter.outgoingCount++;
        database.collection(collection).insertMany(buffer, (error, result) => {
            if (error) {
                logger.error(error.toString());
            }
            mongoCounter.outgoingCount--;

            // if no outgoing inserts, close the connection
            checkReadyToClose(database, mongoCounter);
        });
    }
}

/**
 * Sends all objects in all buffers to the database.
 * 
 * @author Jonathan Tan
 * @param {Map.<string, Object[]>} bufferMap - A mapping from collection name to buffered objects to be inserted.
 * @param {mongodb.Db} database - The database instance.
 * @param {MongoCount} mongoCounter - A counter to keep track of outgoing database calls.
 */
function sendAllBuffersToDatabase(bufferMap, database, mongoCounter) {
    for (let b of bufferMap.entries()) {
        sendBufferToDatabase(b[1], b[0], database, mongoCounter);
    }
}

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
     * Attempts to establish a connection with the MongoDB server.
     * 
     * @author Jonathan Tan
     * @param {string} server - The database server name.
     * @param {number} port - The port number.
     * @param {string} name - The name of the database.
     * @param {number} poolSize - Number of connections in the connection pool.
     * @param {onConnectSuccess} onSuccess - The callback to execute if the connection was successfully established.
     * @param {onConnectFail} onFail - The callback to execute if the connection could not be established.
     */
    connectTo(server, port, name, poolSize, onSuccess, onFail) {
        mongodb.MongoClient.connect(`mongodb://${server}:${port}/${name}`, { server: { poolSize } }, (error, db) => {
            if (error) {
                logger.debug(error.toString());
                onFail();
            }

            if (db) {
                logger.debug("Successfully connected to the database.");

                this._database = db;
                this._addBuffers = new Map();
                this._counter = new MongoCount();
                onSuccess();
            }
        });
    }

    /**
     * Closes the connection to the MongoDB server.
     * 
     * @author Jonathan Tan
     */
    close() {
        if (this._database) {
            // flush all buffers
            sendAllBuffersToDatabase(this._addBuffers, this._database, this._counter);
            this._addBuffers = null;

            // wait for all MongoDB calls to finish
            this._counter.readyToClose = true;
            logger.debug("Waiting for database calls to finish...");
            checkReadyToClose(this._database, this._counter);
        } else {
            logger.debug("There is no open connection to the database to close.");
        }
    }

    /**
     * Buffers a new object to be added to the databse. Will only send the objects to the database if buffer exceeds a threshold.
     * 
     * @author Jonathan Tan
     * @param {Object|Object[]} obj - The object to send to the database. The function assumes that the object is well-formatted.
     * @param {string} collection - The name of the collection into which to add.
     */
    addToCollection(obj, collection) {
        if (this._database === undefined || this._database == null) {
            logger.error("Error: Attempted to add to uninitialized database.")
        } else {
            if (Array.isArray(obj)) {
                // add entire array to the appropriate buffer
                if (this._addBuffers.has(collection)) {
                    this._addBuffers.set(collection, this._addBuffers.get(collection).concat(obj));
                } else {
                    this._addBuffers.set(collection, obj);
                }
            } else {
                // add object to the appropriate buffer
                if (this._addBuffers.has(collection)) {
                    this._addBuffers.get(collection).push(obj);
                } else {
                    this._addBuffers.set(collection, [obj]);
                }
            }

            // flush buffer if it has exceeded the threshold
            if (this._addBuffers.get(collection).length >= BUFFER_THRESHOLD) {
                sendBufferToDatabase(this._addBuffers.get(collection), collection, this._database, this._counter);
                this._addBuffers.set(collection, []);
            }
        }
    }
}
