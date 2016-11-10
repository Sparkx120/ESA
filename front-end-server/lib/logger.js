import bunyan from "bunyan";
import path from "path"
import opts from "./opts.js";
const {debug} = opts;

//Base Logging Configuration
let config = {
    name: 'ESA Server',
    streams: [
        {
            level: 'info',
            stream: process.stdout // log INFO and above to stdout 
        }
    ]
}

//Trace Level Logging with src resolution under Debug Mode
if(debug){
    config.streams.push({
        level: 'trace',
        path: path.join(path.dirname(require.main.filename), "/logs/server_trace.log")
    })
    config.src = true;
}

export default bunyan.createLogger(config);