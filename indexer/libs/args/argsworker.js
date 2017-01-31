/** @module libs/args/argsworker */

import yargs from "yargs";

export default yargs.usage("Usage: $0 [options]")
    // verbose output
    .alias("v", "verbose")
    .nargs("v", 0)
    .describe("v", "Verbose output")
    .demandOption("verbose")

    .argv;
