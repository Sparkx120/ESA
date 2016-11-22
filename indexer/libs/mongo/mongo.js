// logging module
import logger from "../logging/logger";

// MongoDB module
import mongodb from "mongodb";
const MongoClient = mongodb.MongoClient;

// buffer threshold
const BUFFER_THRESHOLD = 1024;

/* helper class to count the number of outgoing MongoDB calls. */
class MongoCount {
    constructor() {
        this._outgoingCount = 0;
    }

    /* setters and getters */
    set outgoingCount(value)    { this._outgoingCount = value; }
    get outgoingCount()         { return this._outgoingCount; }
}

/* Insert all objects in the buffer into the database. */
function sendBufferToDatabase(buffer, collection, database, mongoCounter) {
    mongoCounter.outgoingCount++;
    database.collection(collection).insertMany(buffer, (error, result) => {
        if (error) {
            logger.error(error.toString());
        }
        mongoCounter.outgoingCount--;

        // no outgoing inserts so close the connection
        if (mongoCounter.outgoingCount == 0) {
            database.close();
            database = null;
            logger.info("Closed connection to the database.");
        }
    });
}

/* Send all objects in all buffers o the database. */
function sendAllBuffersToDatabase(bufferMap, database, mongoCounter) {
    for (let b of bufferMap.entries()) {
        sendBufferToDatabase(b[1], b[0], database, mongoCounter);
    }
}

export default class Mongo {
    /* Attempts to establish a connection with the MongoDB server. */
    connectTo(server, port, name, callback) {
        MongoClient.connect(`mongodb://${server}:${port}/${name}`, (error, db) => {
            if(error) {
                logger.error(error.toString());
            }

            if (db) {
                logger.info("Successfully connected to the database.");

                this._database = db;
                this._addBuffers = new Map();
                this._counter = new MongoCount();
                callback();
            }
        });
    }

    /* Closes the connection to the MongoDB server. */
    close() {
        if (this._database) {
            // flush all buffers
            sendAllBuffersToDatabase(this._addBuffers, this._database, this._counter);
            this._addBuffers = null;

            // wait for all MongoDB calls to finish
            logger.info("Waiting for database calls to finish...");
        } else {
            logger.error("There is no open connection to the database to close.");
        }
    }

    /* Buffers a new object to be added to the databse. Will only send the objects to the database if buffer exceeds a threshold. */
    addToCollection(obj, collectionName) {
        if (typeof this._database == "undefined" || this._database == null) {
            logger.error("Error: Attempted to add to uninitialized database.")
        } else {
            // add object to the appropriate buffer
            if (this._addBuffers.has(collectionName)) {
                this._addBuffers.get(collectionName).push(obj);
            } else {
                this._addBuffers.set(collectionName, [obj]);
            }

            // flush buffer if it has exceeded the threshold
            if (this._addBuffers.get(collectionName).length >= BUFFER_THRESHOLD) {
                sendBufferToDatabase(this._addBuffers.get(collectionName), collectionName, this._database, this._counter);
                this._addBuffers.set(collectionName, []);
            }
        }
    }
}
