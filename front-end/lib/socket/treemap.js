import { find, connected, getCollections } from '../data/mongo.js';
import { addCallback } from './socketHandle.js';
import logger from "../logger.js";
const log = logger.child({widget_type: 'treemap.js'});

const TEST_COLLECTION = "2017-03-07T19:48:17.713Z";
const MAX_DEPTH = 1;
const MAX_FILES = 128;

addCallback("treemap", emitTree);
addCallback("collections", getCollectionsEmit);

/**
 * Emit the collections from the database
 * @param {Handle} handler 
 * @param {WebSocket} socket 
 * @param {Object} state 
 */
async function getCollectionsEmit(handler, socket, state){
    log.info("Request for collections made. Emitting Collections Shortly");

    try{
        let collections = await getCollectionsInOrder();

        log.info("Emitting Collections");
        socket.emit('collections', collections);
    }catch(err){
        log.error(`Error getting collections from database: ${err}`);
        socket.emit('collections', [`Error Getting Collections: ${err}`]);
    }
    
}

//Test
// connected(function(){
//     emitTree({emit: (tree)=>console.log(tree)}, {collection: TEST_COLLECTION, root: null});    
// });

/**
 * Emit a tree on a socket rooted at the states root
 * @param {Handle} handler 
 * @param {WebSocket} socket 
 * @param {Object} state 
 */
async function emitTree(handler, socket, state){
    handler.activeRequests.push(this);
    log.info("Request for tree made. Emitting Tree Shortly");

    //Setup State object filling in defaults
    if(!state.collection){
        state.collection = await getNewestValidCollection();
    }
    if(!state.root){
        state.root = null;
    }
    if(!state.maxDepth){
        state.maxDepth = MAX_DEPTH;
    }
    
    //Run Tree Recursion
    let tree = await getTreeAtRootLevel(state, state.root, 0);
    

    //Handle Request Floods by dumping older requests that were for non new roots
    if(handler.activeRequests[handler.activeRequests.length-1] === this || state.newRoot){
        //Send back the complete tree
        log.info(`Emitting Tree from collection: ${state.collection} rooted at: ${state.root}`);
        socket.emit("treemap", {collection:state.collection, 
                                colorMode:null,
                                tree:tree});
    }
    else{
        log.info(`Dumping Request as a new request for treemap has already been made by this socket`);
    }

    //Remove from Request List
    handler.activeRequests.splice(handler.activeRequests.indexOf(this), 1);
}

/**
 * Get Tree Recursively
 * @param {String} state - The props from the TreeMap component
 * @param {String} root - The current root to scan
 * @param {Number} depth - The current depth of recursion
 */
async function getTreeAtRootLevel(state, root, depth){
    //Try Catch block for Async Call
    try{
        var tree = {};
        let results = [];

        //Handle Root Case
        if(root == null){
            results = await find(state.collection, {parent: null});
        }
        else{
            results = await find(state.collection, {_id: root});
        }

        //If Root is empty on Root Node then FS Tree is not found
        if(root == null && results.length == 0){
            throw "Invalid Collection. No Root Node found!";
        }
        
        //Setup local tree node
        tree.path = root ? root : results[0]._id
        tree.isFolder = true;
        tree.children = [];
        applyFields(tree, await getFieldsOfRecord(state.collection, tree.path));
        
        //Fill in files and recurse on folders
        // if(state.displayMode.maximumFiles.set && depth > 0 &&
        //     results[0].files.length + results[0].folders.length > parseInt(state.displayMode.maximumFiles.value)){
        //     //This if block is semi redudant now and its not is the else that is important
        //     //applyFields(tree, await getFieldsOfRecord(state.collection, tree.path));
        // }
        if(!(state.displayMode.maximumFiles.set && depth > 0 &&
            results[0].files.length + results[0].folders.length > parseInt(state.displayMode.maximumFiles.value))){
            //This is necessary for graph render right now
            tree.folderSize = tree.size;
            tree.size = undefined;

            //Recurse folders to max depth
            if(!state.displayMode.directoryOnly.set && depth <= state.maxDepth){
                for(let i=0;i<results[0].folders.length;i++){ //We can parallelize this later
                    tree.children.push(await getTreeAtRootLevel(state, results[0].folders[i], depth+1));
                }
            }
            //If Reached Max Depth then turn folder into leaf
            else{
                for(let i=0;i<results[0].folders.length;i++){
                    
                    let newRecord = {
                        path: results[0].folders[i],
                        isFolder: true,
                    };
                    
                    tree.children.push(applyFields(newRecord, await getFieldsOfRecord(state.collection, results[0].folders[i])));
                }
            }
            //File leaves
            if(!state.displayMode.directoryOnly.set){
                for(let i=0;i<results[0].files.length;i++){
                    
                    let newRecord = {
                        path: results[0].files[i],
                        isFolder: false,
                    };

                    tree.children.push(applyFields(newRecord, await getFieldsOfRecord(state.collection, results[0].files[i])));
                }
            }
        }

        //Return Results
        return tree;
    }
    catch(err){
        let error = `Error Getting Tree on Collection ${state.collection} at root ${root}. Error: ${err}`;
        log.error(error);
        return {path: error, size: 0, isFolder: false};
    }
}

/**
 * Apply fields from fields to the node
 * @param {Object} node 
 * @param {Object} fields 
 */
function applyFields(node, fields){
    for(let field in fields){
        node[field] = fields[field];
        // if(node.isFolder){
        //     console.log(node[field]);
        // }
    }
    return node;
}

/**
 * Get Size of a File or Folder in Collection
 * @param {*} collection - The collection to search
 * @param {*} path - The path to find a size for
 */
async function getSizeOfRecord(collection, path){
    try{
        let  result = await find(collection, {_id: path});
        if(result.length == 0) throw `${path} not found in ${collection}!`;

        return result[0].size;
    }
    catch(err){
        log.error(`Error Retreiving size of ${path} ` + err);
    }
}

/**
 * Get fields of a File or Folder in Collection
 * @param {*} collection - The collection to search
 * @param {*} path - The path to find a size for
 */
async function getFieldsOfRecord(collection, path){
    try{
        let result = await find(collection, {_id: path});
        if(result.length == 0) throw `${path} not found in ${collection}!`;

        return {
            size:result[0].size,
            isSymLink:result[0].isSymLink,
            owner:result[0].owner,
            group:result[0].group,
            lastModified:result[0]["last-modified"]
        };
    }
    catch(err){
        log.error(`Error Retreiving fields of ${path} ` + err);
    }
}

/**
 * Filter out empty collections
 * @param {Array} collections 
 */
async function filterEmpty(collections){
    try{
        let empty = [];
        for(let i=0; i<collections.length;i++){
            let result = await find(collections[i].name, {parent: null});
            empty.push(result.length!=0);
        }
        collections = collections.filter((collection, i)=>{
            return empty[i];
        });
    }catch(e){
        log.error(`Could not filter empty collections! ${e}`);
        return collections;
    }

    return collections;
}

/**
 * Gets Collections completed collections sorted in order by date
 */
async function getCollectionsInOrder(){
    let regex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/g;
    
    let collections = await getCollections();
    log.info(`Sorting collections from a total of ${collections.length} collections`);

    //Deal with empty or in process collections
    collections = await filterEmpty(collections);
    
    //Sort Collections by Date
    if(collections.length > 0){
        collections = collections.sort((a, b)=>{
            let timestampA = Date.parse(regex.exec(a.name));
            regex.lastIndex = 0;
            let timestampB = Date.parse(regex.exec(b.name));
            regex.lastIndex = 0;
            if(timestampA == timestampB)    return 0;
            if(timestampA > timestampB)     return -1;
            else                            return 1;
        });

        log.info(`Got Sorted Collections`);
        return collections;
    }
    else{
        throw "Error No collections in Database!";
    }
}

/**
 * Gets the newest collection that is complete from the database.
 * @returns {String} The name of the collection to query
 */
async function getNewestValidCollection(){
    return (await getCollectionsInOrder())[0].name;
}