import path from "path";
import express from "express";
import http from "http";
import compression from "compression";
import socketio from "socket.io";
import logger from "./logger.js";
import opts from "./opts.js";
import Handle from './socketHandle.js';
import treemap from './treemap.js';

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

//Temporary Static Routing for React Routes (Will make dynamic later)
app.use('/fs', express.static(`${path.join(staticPath,'index.html')}`))
app.use('/landing', express.static(`${path.join(staticPath,'index.html')}`))
app.use('/test', express.static(`${path.join(staticPath,'index.html')}`))

//Start the Server (Server Listening in seperate library)
server.listen(port, bind, ()=> log.info(`Listening on ${bind}:${port}`));

//Handle Socket IO Connections (Move to seperate Library)
io.on('connection', function (socket) {
  log.info("Socket Connected"); //Dummy Socket for now
  new Handle(socket);
});