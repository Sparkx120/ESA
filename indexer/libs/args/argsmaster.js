/** @module libs/args/argsmaster */

import yaml from "node-yaml-config";
import yargs from "yargs";

export default yargs.usage("Usage: $0 [options]")
    // root directory
    .alias("r", "root_dir")
    .nargs("r", 1)
    .describe("r", "Root directory")
    .normalize("r")

    // continue key
    .alias("c", "contd")
    .nargs("c", 1)
    .describe("c", "Resume key")

    // database server hostname
    .alias("s", "server")
    .nargs("s", 1)
    .describe("s", "Database hostname")

    // port number
    .alias("p", "port")
    .nargs("p", 1)
    .default("p", 27017)
    .describe("p", "Port number")

    // RabbitMQ server
    .alias("q", "rabbitmq")
    .nargs("q", 1)
    .describe("q", "RabbitMQ hostname")

    // buffer threshold
    .alias("b", "buffer_threshold")
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
            root_dir: config.indexer.root,
            contd: config.indexer.resume,
            server: config.database.server,
            port: config.database.port,
            rabbitmq: config.database.rabbitmq,
            buffer_threshold: config.database.buffer,
            debug: config.database.debug_override,
            verbose: config.verbose
        };
    })

    // provide a few examples of how to use arguments
    .example("$0 --root_dir C: -s localhost -p 27017 -q localhost", "Index C: drive and output to the server on mongodb://localhost:27017")
    .example("$0 --root_dir C: -q localhost --debug out.json", "Index C: drive and output to JSON file out.json")
    .example("$0 --contd 0a1b2c3d4e5f6789abc", "Resume indexer execution identified by given key")
    .example("$0 --config config.yaml", "Setup and start indexer according to configuration in YAML file config.yaml")

    // specify data types of options
    .boolean("verbose")
    .number(["port", "buffer_threshold"])
    .string(["root_dir", "contd", "server", "rabbitmq", "config", "debug"])

    // ensure that either the server hostname or the debug file has been specified unless the continue option is present
    .check((argv, aliases) => { return !(argv.server === undefined && argv.debug === undefined && argv.contd === undefined); })

    // ensure that a root and rabbitmq server has been specified unless the continue option is present
    .check((argv, aliases) => { return !((argv.root_dir === undefined || argv.rabbitmq === undefined) && argv.contd === undefined); })

    .argv;
