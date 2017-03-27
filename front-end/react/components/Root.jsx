import React from 'react';
import ReactDOM from 'react-dom';
import SplitPane from './splitpane/SplitPane.jsx';
import Resizer from './splitpane/Resizer.jsx';

import scss from '../styles/accordion.scss';
import FileSystem from './filesystem/FileSystem.jsx';
import FileInfo from './fileinfo/FileInfo.jsx';
import Graphs from './graph/Graphs.jsx';

import socket from '../socket.js';


import DemoTree from './filesystem/treebeard/example/app.js';

const DEFAULT_SPLIT = "30%";
const GO_UP_DIR_KEY = ""
/**
 * Root TreeMap Application container with logic and callback handling
 * @author Tianzhi Zhu
 * @author James Wake
 * @class Root
 */
class Root extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            dataStack: [{path:"Loading"}],  //The Stack of tree Roots and their data
            dataHeight: 0,                  //The height of the dataStack
            root: null,                     //The current Root
            loading: true,                  //Weather new data is being loaded

            collection: null,               // The current Collection
            collections: [],                // All the collections available

            displayMode: {                                  //Configures Display Mode
                directoryOnly: {set: false, value: null},   //Directory Only Mode
                maximumFiles: {set: true, value: 128},      //Maximum Files Mode
                everything: {set: false, value: null}       //Everything Mode
            },
            colorMode: {                                //Configures Color Mode
                depth: {set: true, value: null},        //Depth Mode
                fileType: {set: false, value: ""},      //File Type Highlighting Mode
                serverConfig: {set: false, value: null} //Server Defined Configuration Mode
            },
            customColor: null,

            //filter.jsx under filesystem
            filters: {
                name:{set: false, value: ""},
                owner:{set: false, value: ""},
                size:{set: false, value: "100"},
                created:{set: false, value: new Date()},
                modified:{set: false, value: new Date()}
            },

            splitSize: this.getSplitSizeFromStorage() //Default Split Size Overriden by drag and localStorage
        }
    }

    componentDidMount(){
        // console.log("in root, componentDidMount");
        this.getInitTree(this.state.collection);
        this.getInitCollections();
    }

    /**
     * Get New Tree and initialize
     */
    getInitTree(collection){
        //Initialize the Tree
        // var data;
        // console.log("in root, getInitTree");
        socket.on('treemap', (data)=>{
            console.log("Recieving Tree (data from root): ", data);

            let collections = this.state.collections;
            // if(collections.indexOf(data.collection) < 0){
            //     collections.push(data.collection);
            // }

            this.setState({dataStack: [data.tree],
                           root: data.tree.path,
                           loading:false,
                           dataHeight:1,
                           customColor: data.colorMode,
                           collection: data.collection, //if collection null then server will find newest
                           });
            socket.off('treemap');
        });
        this.setState({loading: true});
        socket.emit('treemap', {collection: collection,
                                root: null,
                                displayMode: this.state.displayMode,
                                colorMode: this.state.colorMode,
                                newRoot: true
                               });
    }

    /**
     * Get Collections from the database
     */
    getInitCollections(){
        socket.on('collections', (data)=>{
            console.log("Receiving collections (from MongoDB): ", data);
            this.setState({collections: data});
        });
        socket.emit('collections');
    }

    //If you ever refactor this consider Redux (we didn't have time)
    /**
     * Action Handler for Application (Reducer like)
     * @class Root
     * @param {String} action - Action type
     * @param {Object} config - Params Object for handler 
     */
    action(action, ...params){
        switch(action){
            case 'GET_TREE':
                this.updateRoot(...params);
                break;
            case 'GO_UP_TREE':
                this.upRoot();
                break;
            case 'CHANGE_FILTER':
                this.setFilterConfig(...params);
                break;
            case 'CHANGE_DISPLAY_MODE':
                this.setDisplayMode(...params);
                break;
            case 'CHANGE_COLOR_MODE':
                this.setColorMode(...params);
                break;
            case 'SET_COLLECTION':
                this.setCollection(...params);
                break;
        }
    }

    setCollection(newCollection){
        console.log(`Setting new Collection (change drive): ${newCollection}`);
        this.getInitTree(newCollection);
    }

    /**
     * Updates the root to point to a new root and
     * pushes the data to the datastack
     * @class Root
     * @param {Object} elem 
     */
    updateRoot(elem){
        this.setState({loading: true})
        socket.on('treemap', (data)=>{
            console.log("Recieving Tree (data from sub-folder): ", data);
            
            //Back Stack
            let localStack = this.state.dataStack;
            localStack.push(data.tree);
            console.log("Local Stack (file sys structure): ", localStack);
            //Set State
            this.setState({dataStack: localStack,
                           loading: false,
                           dataHeight: localStack.length,
                           root: elem.data.path,
                           customColor: data.colorMode});
            socket.off('treemap');
        });
        socket.emit('treemap', {collection: this.state.collection,
                                root: elem.data.path,
                                displayMode: this.state.displayMode,
                                colorMode: this.state.colorMode,
                                newRoot: true});
    }

    /**
     * Moves the dataStack back one root
     * @class Root
     */
    upRoot(){
        let localStack = this.state.dataStack;
        localStack.pop();
        this.setState({dataStack: localStack,
                       dataHeight:localStack.length,
                       root:localStack[localStack.length-1].path});
    }

    /**
     * Update dataStack at current root with new configuration
     * Note server should dump already in progress requests and prioritize current request
     * @class Root
     */
    updateTreeView(){
        socket.on('treemap', (data)=>{
            console.log("Receiving Tree (new mode option): ", data);
            let dataStack = this.state.dataStack;
            dataStack.pop();
            dataStack.push(data.tree);
            this.setState({dataStack, 
                           loading:false,
                           customColor: data.colorMode});
            socket.off('treemap');
        });
        socket.emit('treemap', {collection: this.state.collection,
                                root: this.state.root,
                                displayMode: this.state.displayMode,
                                colorMode: this.state.colorMode,
                                filters: this.state.filters})
        this.setState({loading:true});
    }

    /**
     * Updates The Display Mode configuration in State
     * @class Root
     * @param {Object} - newMode {type:String, value: String} 
     */
    setDisplayMode(newMode){
        let displayMode = this.state.displayMode;
        switch(newMode.type){
            case 'dirOnly':
                displayMode.directoryOnly.set = true;
                displayMode.maximumFiles.set = false;
                displayMode.everything.set = false;
                break;
            case 'maxFiles':
                displayMode.directoryOnly.set = false;
                displayMode.maximumFiles.set = true;
                displayMode.maximumFiles.value = newMode.value;
                displayMode.everything.set = false;
                break;
            case 'everything':
                displayMode.directoryOnly.set = false;
                displayMode.maximumFiles.set = false;
                displayMode.everything.set = true;
                break;
        }

        this.updateTreeView();
        this.setState({displayMode: displayMode});
    }

    /**
     * Updates The Color Mode configuration in State
     * @class Root
     * @param {Object} - newMode {type:String, value: String} 
     */
    setColorMode(newMode){
        let colorMode = this.state.colorMode;
        switch(newMode.type){
            case 'depth':
                colorMode.depth.set = true;
                colorMode.fileType.set = false;
                colorMode.serverConfig.set = false;
                break;
            case 'fileType':
                colorMode.depth.set = false;
                colorMode.fileType.set = true;
                colorMode.fileType.value = newMode.value;
                colorMode.serverConfig.set = false;
                break;
            case 'server_defined':
                colorMode.depth.set = false;
                colorMode.fileType.set = false;
                colorMode.serverConfig.set = true;
                break;
        }
        //this.updateTreeView();
        this.setState({colorMode: colorMode});
    }

    setFilterConfig(newConfig){
        let filters = this.state.filters;
        filters[newConfig.type].set = newConfig.set;
        filters[newConfig.type].value = newConfig.value;
        this.setState({filters});
    }

    /**
     * Sets the SplitSize for the main view into localstorage and state
     * @param {String} size 
     */
    setSplitSize(size){
        if (typeof(Storage) !== "undefined") {
            // Code for localStorage/sessionStorage.
            localStorage.setItem("splitSize", size);
        }
        this.setState({splitSize: size});
    }

    /**
     * Tries to get the splitSize for the main view from localstorage
     */
    getSplitSizeFromStorage(){
        if (typeof(Storage) !== "undefined") {
            let splitSize = localStorage.getItem("splitSize"); 
            if(splitSize){
                return splitSize;
            }
            else{
                //Nothing in localStorage
                return DEFAULT_SPLIT;
            }
        } else {
            // Sorry! No Web Storage support..
            return DEFAULT_SPLIT;
        }
    }

    render(){
        return(
            <SplitPane split="vertical" defaultSize="0%" maxSize="" ref="filesystem">
                <h1 id='welcome'>Welcome to 4J!!!</h1>
                    <SplitPane split="vertical" onDragFinished={(size)=>{this.setSplitSize(size)}} defaultSize={this.state.splitSize} maxSize="">
                        <FileSystem state={this.state} action={this.action.bind(this)}/>
                        {/*<FileSystem/>   //cannot find the property dataStack*/}
                        <Graphs state={this.state} action={this.action.bind(this)}/>
                    </SplitPane>
            </SplitPane>
        )
    }
}
export default Root;

