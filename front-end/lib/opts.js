import yargs from "yargs"; 

export default yargs.usage('Usage: $0 <command> [options]')
    .example('$0 -p 8080 -b 0.0.0.0')
    
    //Port
    .alias('p', 'port')
    .nargs('p', 1)
    .number('p')
    .describe('p', 'HTTP Port')
    .default('p', 8080)
    
    //Binding
    .alias('b', 'bind')
    .nargs('b', 1)
    .describe('b', 'HTTP NIC Binding')
    .default('b', '0.0.0.0')
    
    //Debug Mode
    .alias('d', 'debug')
    .boolean('d')
    .default('d', false)
    .describe('d', "Debug Mode: Verbose Logging to File")
    
    //Help
    .help('h')
    .alias('h', 'help')
    .argv;