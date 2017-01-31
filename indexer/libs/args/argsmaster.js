/** @module libs/args/argsmaster */

import yaml from "node-yaml-config";
import yargs from "yargs";

export default yargs.usage("Usage: $0 [options]")
    // root directory
    .alias("r", "root")
    .nargs("r", 1)
    .describe("r", "Root directory")
    .normalize("r")
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

    // buffer threshold
    .alias("b", "buffer")
    .nargs("b", 1)
    .default("b", 2048)
    .describe("b", "Buffer threshold")

    // JSON debug override
    .alias("d", "debug")
    .nargs("d", 1)
    .describe("d", "JSON debug override file")

    // verbose output
    .alias("v", "verbose")
    .nargs("v", 0)
    .describe("v", "Verbose output")

    // help
    .help("h")
    .alias("h", "help")

    // get configurations from YAML file, if option is present
    .config("config", "YAML config file", (configPath) => {
        let config = yaml.load(configPath);

        return {
            root: config.indexer.root,
            server: config.database.server,
            port: config.database.port,
            buffer: config.database.buffer,
            debug: config.database.debug_override,
            verbose: config.verbose
        };
    })

    // provide a couple example of how to use arguments
    .example("$0 --root C: -s localhost -p 27017", "Index C: drive and output to the server on localhost:27017")
    .example("$0 --root C: --debug out.json", "Index C: drive and output to JSON file debug.json")
    .example("$0 --config config.yaml", "Index according to configuration in YAML file config.yaml")

    // specify data types of options
    .boolean("verbose")
    .number(["port", "buffer"])
    .string(["root", "server", "config", "debug"])

    // ensure that either the server hostname or the debug file has been specified
    .check((argv, aliases) => { return !(argv.server === undefined && argv.debug === undefined); })

    .argv;
