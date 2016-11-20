import path from "path";
import express from "express";
import http from "http";
import compression from "compression";
import socketio from "socket.io";
import logger from "./logger.js";
import opts from "./opts.js";

//Configure Options and Logger
const {port, bind} = opts;
const log = logger.child({widget_type: 'server_index.js'});

//Setup Express
const app = express();
const server = http.Server(app);

//Setup Compression Middleware
app.use(compression());

//Setup Socket
const io = socketio(server);

//Setup Static File Hosting
const staticPath = path.join(path.dirname(require.main.filename), '/www');
log.info(`Static Hosting Path Set to: ${staticPath}`)
app.use(express.static(staticPath));

//Start the Server
server.listen(port, bind, ()=> log.info(`Listening on ${bind}:${port}`));

//Handle Socket IO Connections
io.on('connection', function (socket) {
  log.info("Socket Connected"); //Dummy Socket for now
  
  socket.on("home", () => socket.emit("home", "Hello World From the Server"));
});