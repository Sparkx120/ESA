/** @module libs/args/argsworker */

import yargs from "yargs";

export default yargs.usage("Usage: $0 [options]")
    // verbose output
    .alias("v", "verbose")
    .nargs("v", 0)
    .describe("v", "Verbose output")
    .demandOption("verbose")

    // RabbitMQ server
    .alias("q", "rabbitmq")
    .nargs("q", 1)
    .describe("q", "RabbitMQ hostname")
    .demandOption("rabbitmq")

    // reply queue name
    .alias("n", "queue_name")
    .nargs("n", 1)
    .describe("n", "Reply to queue")
    .demandOption("queue_name")

    .argv;
