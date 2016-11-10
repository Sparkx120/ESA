// use yargs as parse command line arguments
import * as yargs from "yargs";

// specify command line arguments
const argv = yargs.usage("Usage: $0 [options]")
    .alias("r", "root")
    .nargs("r", 1)
    .describe("r", "root directory")
    .demand(["r"])
    .argv;

// separate and export the arguments
export let root = argv.root;
