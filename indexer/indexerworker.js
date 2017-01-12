import indexer from "./libs/indexer/indexerutils";
import fs from "fs";
import logger from "./libs/logging/logger";
import protocol from "./libs/parallel/protocol";

/**
 * Takes a list of directory and sends back to the master the sub-directories and file metadata per directory
 * and profiling metrics after all the directories have been processed.
 * 
 * @param {DirectoryInfo[]} dirs - The directories to process.
 */
function processDirectories(dirs) {
    let totalFiles = 0;
    let totalDirs = 0;
    let totalUnknown = 0;

    for (let dir of dirs) {
        // process the directory
        let processed = indexer.processDirectory(dir);
        //toBeProcessed = toBeProcessed.concat(processed.toProcess);

        // accumulate profiler metrics
        totalFiles += processed.filesProcessed;
        totalDirs += processed.dirsProcessed;
        totalUnknown += processed.unknownSeen;

        // send back file metadata from processed directory
        outputStream.write(protocol.convertObject({
            returned: false,
            process: processed.toProcess
        }));

        // send the sub-directories to the master for further traversal
        if (processed.toContinue.length != 0) {
            outputStream.write(protocol.convertObject({
                returned: false,
                continue: processed.toContinue
            }));
        }
    }

    // inform master that we are done and send the processing metrics
    outputStream.write(protocol.convertObject({
        returned: true,
        profile: { files: totalFiles, dirs: totalDirs, unknown: totalUnknown }
    }));
}

// create input stream on fd[3]
const inputStream = fs.createReadStream(null, { fd: 3 });
let inputBuffer = Buffer.allocUnsafe(0);

// create output stream on fd[4]
const outputStream = fs.createWriteStream(null, { fd: 4 });

// upon receiving a list of directories from the master process, process them and send information back to master
inputStream.on("data", (chunk) => {
    // add received data to input buffer as string
    inputBuffer = Buffer.concat([inputBuffer, chunk]);

    // read objects from the buffer while there are some
    let receivedObject;
    do {
        receivedObject = protocol.readObject(inputBuffer);

        if (receivedObject != null) {
            // process the directory list
            processDirectories(receivedObject);

            // remove processed directory list from buffer
            inputBuffer = protocol.removeObject(inputBuffer);
        }
    } while (receivedObject != null);
});
