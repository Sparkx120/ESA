import mongodb from 'mongodb'
import yaml  from 'js-yaml';
import fs from 'fs';
import path from "path";
import logger from "../logger.js";
const log = logger.child({widget_type: 'mongo.js'});

//Constant Defaults
const DEFAULT_PORT = 27017; 
const MONGODB_YAML = "./mongodb.yaml";

//Load Config File if it exists
let config = null;
try{
    config = yaml.safeLoad(fs.readFileSync(path.normalize(MONGODB_YAML), 'utf8'));
} 
catch(err){
    log.info(`${path.resolve(path.normalize(MONGODB_YAML))} not found using default localhost config`);
}

//Build Connection url
let mongoURL = "";
if(config){
    log.info("mongodb.yaml config file found");

    //User String if User is defined otherwise anon connection
    let user = "";
    if(config.username){
        user = `${config.username}:${config.password}@`;
    }

    //Build the url
    mongoURL = `mongodb://${user}${config.server}:${config.port ? config.port : DEFAULT_PORT}/${config.database}`;
}
else{
    //Default localhost anon connection
    mongoURL = "mongodb://localhost:27017/esa";
}

//DB variable for when DB is connected
let db = null;

//On connect operations if pending
let onConnect = [];

/**
 * Create the connection to MongoDB and setup the environment
 */
function connectMongo(){ 
    mongodb.MongoClient.connect(mongoURL, function(err, database) {
        if(err){log.error("Failed to connect to MongoDB! ", err); throw "Error Re/Connecting to MongoDB";}
        log.info("Connected successfully to mongoDB");

        //Set the db active
        db = database;

        //Deal with pending onconnect function requests
        for(let i in onConnect){
            onConnect[i].fn(onConnect[i].cb);
        }
        onConnect = [];

        //Add listener for disconnect so that the db active variable can be unset
        db.addListener("disconnect", function(){
            db = null;
            //Try reconnect
            connect();
        });
    });
}

//Immediate Connect (Note that if the DB fails to connect an exception will be thrown and the server will shutdown)
connectMongo();

/**
 * Get Mongo Collections 
 * @param {Function} callback 
 */
export function getCollections(){
    if(db){
        return new Promise(function(resolve, reject){
            db.listCollections().toArray(function(err, result){
                if(err) reject(err);
                resolve(result);
            });
        });
    }
    else{
        return new Promise(function(resolve, reject){
            reject("Error Connection not established yet!!!");
        });
    }   
}

/**
 * Query the database
 * @param {String} collection 
 * @param {Object} queryObj
 */
export function find(collection, queryObj){
    if(db){
        return new Promise(function(resolve, reject){
            db.collection(collection).find(queryObj).toArray(function(err, result){
                if(err) reject(err);
                //console.log(result.length);
                resolve(result);
            });
        });
    }
    else{
        return new Promise(function(resolve, reject){
            reject("Error Connection not established yet!!!");
        });
    }
}

/**
 * Drops a collection from the database
 * @param {String} collection 
 */
export function dropCollection(collection){
    if(db){
        return new Promise(function(resolve, reject){
            try{
                db.collection(collection).drop();
                resolve();
            }catch(e){
                reject(e);
            }
            
        });
    }
    else{
        return new Promise(function(resolve, reject){
            reject("Error Connection not established yet!!!");
        });
    }
}

/**
 * Nasty Connection poller wrapped in a promise
 */
export function waitForConn(){
    return new Promise(function(resolve, reject){
        let total = 0;
        let z = setInterval(
            ()=>{
                if(db){
                    resolve();
                }
                total += 100;
                if(total > 10000){
                    reject();
                    clearInterval(z);
                }
            },
            100
        );
    });
}