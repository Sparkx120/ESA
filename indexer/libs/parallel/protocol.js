/** @module libs/parallel/protocol */

/**
 * Protocol for sending object across file descriptors when using the Parallel class.
 * 
 * A message should be formatted such that the first four bytes hold the length of the remaining message.
 * Bytes are in big-endian order.
 */
export default {

    /**
     * Formats an object according to protocol.
     * 
     * @param {Object} message - Message to format.
     * @returns {Buffer} A Buffer object which stored the formatted message.
     */
    convertObject: (message) => {
        // stringify message
        let stringified = JSON.stringify(message);

        // determine the length of the stringified message in bytes
        let stringifiedLength = Buffer.from(stringified).byteLength;

        // create buffer equal in size to stringified message + 4 bytes for length
        let sendBuffer = Buffer.allocUnsafe(stringifiedLength + 4);

        // write the length of the message in the first four bytes
        sendBuffer.writeUInt32BE(stringifiedLength, 0);

        // write the message in the remaining buffer
        sendBuffer.write(stringified, 4);

        return sendBuffer;
    },

    /**
     * Reads one object from the buffer.
     * 
     * @param {Buffer} buffer - The buffer from which to read.
     * @returns A single JS object, null if there are no complete objects in the buffer.
     */
    readObject: (buffer) => {
        // can not read from empty buffer
        if (buffer.byteLength < 4) {
            return null;
        }

        // read object length from buffer
        let objLength = buffer.readUInt32BE(0);

        // incomplete buffer so return null
        if (objLength > buffer.byteLength - 4) {
            return null;
        }

        // read object
        let message = JSON.parse(buffer.slice(4, 4 + objLength).toString());

        // return object
        return message;
    },

    /**
     * Removes one object from the buffer.
     * 
     * @param {Buffer} buffer - The buffer from which to remove an object.
     * @returns A buffer with one object removed, null if no remove operation was made.
     */
    removeObject: (buffer) => {
        // can not read from empty buffer
        if (buffer.byteLength < 4) {
            return null;
        }

        // read object length from buffer
        let objLength = buffer.readUInt32BE(0);

        // incomplete buffer so return null
        if (objLength > buffer.byteLength - 4) {
            return null;
        }

        // decrease buffer by length of one object
        buffer = buffer.slice(4 + objLength);

        // return buffer
        return buffer;
    }
}
