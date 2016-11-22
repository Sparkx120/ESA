// use yargs to parse command line arguments
import yargs from "yargs";

// specify command line arguments
export default yargs.usage("Usage: $0 [options]")
    // root directory
    .alias("r", "root")
    .nargs("r", 1)
    .describe( "r", "root directory")

    // database server
    .alias("s", "server")
    .nargs("s", )
    .describe("s", "database server")

    // port number
    .alias("p", "port")
    .nargs("p", 1)
    .default("p", 27017)
    .describe("p", "port number")

    // help
    .help("h")
    .alias("h", "help")

    .demand(["r", "s"])
    .example("$0 -r C: -s localhost -p 27017")
    .argv;
