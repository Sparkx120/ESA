/** @module libs/args/argsmaster */

import yaml from "node-yaml-config";
import yargs from "yargs";

export default yargs.usage("Usage: $0 [options]")
    // root directory
    .alias("r", "root")
    .nargs("r", 1)
    .describe("r", "Root directory")
    .demandOption("root")

    // database server hostname
    .alias("s", "server")
    .nargs("s", 1)
    .describe("s", "Database hostname")

    // port number
    .alias("p", "port")
    .nargs("p", 1)
    .default("p", 27017)
    .describe("p", "Port number")

    // help
    .help("h")
    .alias("h", "help")

    // get configurations from YAML file, if option is present
    .config("config", "YAML config file", (configPath) => { return yaml.load(configPath); })

    // provide a couple example of how to user arguments
    .example("$0 --root C: --config config.yaml")
    .example("$0 --root C: -s localhost -p 27017")

    // specify data types of options
    .number("port")
    .string(["root", "server", "config"])

    // ensure the the server hostname has been specified
    .check((argv, aliases) => { return !(argv.server === undefined); })

    .argv;
