import logger from "../logger.js";
const log = logger.child({widget_type: 'socketHandle.js'});

const activeCallbacks = {
    "home": (socket) => socket.emit("home", "Hello World From the server")
};
const activeHandles = [];

/**
 * Handle Class to "Handle" sockets
 */
export default class Handle{
    constructor(socket){
        log.info("New Socket connected Handle Setup");
        this.socket = socket;
        this.activeRequests = []

        //Add to Handles list
        activeHandles.push(this);
        
        //Sync callbacks
        this.syncCallbacks();
    }

    //Sync Callbacks in activeCallbacks
    syncCallbacks(){
        log.info("Syncing callbacks for new socket connection");
        for(let route in activeCallbacks){
            this.socket.on(route, (...params)=>{
                activeCallbacks[route](this, this.socket, ...params);
            });
        }
    }
}

//Add a new Socket callback
export function addCallback(route, callback){
    activeCallbacks[route] = callback;
    activeHandles.map((handle)=>handle.syncCallbacks());
}