import amqp from "amqplib/callback_api";
import args from "./libs/args/argsworker";
import indexer from "./libs/indexer/indexerutils";
import readline from "readline";

// get the command-line arguments
const { verbose, rabbitmq, queue_name } = args;

/**
 * Takes a list of directory and sends back to the master the sub-directories and all contained file
 * metadata, as well as profiling metrics.
 *
 * @param {amqp.Channel} channel - The channel between the master process and this worker process.
 * @param {string} replyQueue - The queue into which to reply.
 * @param {DirectoryInfo[]} dirs - The directories to process.
 */
function processDirectories(channel, replyQueue, dirs) {
    for (let dir of dirs) {
        // process the directory
        let processed = indexer.processDirectory(dir);

        // create a reply that contains all the processing information
        let dirReply = {
            process: processed.toProcess,
            profile: { files: processed.filesProcessed, dirs: processed.dirsProcessed, unknown: processed.unknownSeen }
        };

        // also include sub-directories to be traversed, if they exist
        if (processed.toContinue.length != 0) {
            dirReply.continue = processed.toContinue
        }

        // send back processing data to master
        channel.sendToQueue(replyQueue, new Buffer(JSON.stringify(dirReply)));
    }

    // notify master that we are done processing
    channel.sendToQueue(replyQueue, new Buffer("{\"_returned\":true}"));

    // acknowledge the intial message
    channel.ack(currentMessage);
}

let currentMessage;

// connect to local RabbitMQ server
amqp.connect(`amqp://${rabbitmq}`, (err, conn) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    // create a new protocol channel
    conn.createConfirmChannel((err, channel) => {
        // only work with one item at a time
        channel.prefetch(1);

        // create a new queue for receiving messages from master
        channel.assertQueue(queue_name, { durable: false }, (err, ok) => {
            // retrieve a message from the queue
            channel.consume(ok.queue, (msg) => {
                currentMessage = msg;

                // process the directories sent from master
                processDirectories(channel, currentMessage.properties.replyTo, JSON.parse(currentMessage.content));
            });

            console.log(queue_name);
        });
    });
});

// add a few signal handlers to try and catch early termination
// in such a case, try to requeue current message so it can re-processed
if (process.platform === "win32") {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on("SIGINT", () => {
        process.emit("SIGINT");
    });
}
process.on("SIGINT", () => {
    if (channel && currentMessage) {
        channel.nack(currentMessage);
        process.exit();
    }
});
