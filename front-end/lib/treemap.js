import { find, connected } from './mongo.js';
import { addCallback } from './socketHandle.js';
import logger from "./logger.js";
const log = logger.child({widget_type: 'treemap.js'});

const TEST_COLLECTION = "2017-03-07T19:48:17.713Z";
const MAX_DEPTH = 1;
const MAX_FILES = 128;

addCallback("treemap", emitTree);

//Test
// connected(function(){
//     emitTree({emit: (tree)=>console.log(tree)}, {collection: TEST_COLLECTION, root: null});    
// });

/**
 * Emit a tree on a socket rooted at the states root
 * @param {Object} socket 
 * @param {Object} state 
 */
async function emitTree(socket, state){
    log.info("Request for tree made. Emitting Tree Shortly");
    if(!state.collection){
        state.collection = TEST_COLLECTION;
    }
    if(!state.root){
        state.root = null;
    }
    if(!state.maxDepth){
        state.maxDepth = MAX_DEPTH;
    }
    if(!state.maxFiles){
        state.maxFiles = MAX_FILES;
    }

    let tree = await getTreeAtRootLevel(state, state.root, 0);

    log.info(`Emitting Tree from collection: ${state.collection} rooted at: ${state.root}`);
    socket.emit("treemap", tree);
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
        
        //Setup local tree node
        tree.path = root ? root : results[0]._id
        tree.isFolder = true;
        tree.children = [];

        //Fill in files and recurse on folders
        if(depth > 0 && results[0].files.length + results[0].folders.length > state.maxFiles){
            tree.size = await getSizeOfRecord(state.collection, tree.path);
        }
        else{
            //File leaves
            for(let i=0;i<results[0].files.length;i++){
                tree.children.push({
                    path: results[0].files[i],
                    isFolder: false,
                    size: await getSizeOfRecord(state.collection, results[0].files[i])
                });
            }
            //Recurse folders to max depth
            if(depth <= state.maxDepth){
                for(let i=0;i<results[0].folders.length;i++){ //We can parallelize this later
                    tree.children.push(await getTreeAtRootLevel(state, results[0].folders[i], depth+1));
                }
            }
            //If Reached Max Depth then turn folder into leaf
            else{
                for(let i=0;i<results[0].folders.length;i++){
                    tree.children.push({
                        path: results[0].folders[i],
                        isFolder: true,
                        size: await getSizeOfRecord(state.collection, results[0].folders[i])
                    });
                }
            }
        }

        //Return Results
        return tree;
    }
    catch(err){
        log.error(`Error Getting Tree on Collection ${state.collection} at root ${root} `, err);
        return {path: "Error Getting Tree", size: 0, isFolder: false};
    }
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
 * Gets the newest collection that is complete from the database.
 * @returns {String} The name of the collection to query
 */
async function getNewestValidCollection(){
    return TEST_COLLECTION;
}