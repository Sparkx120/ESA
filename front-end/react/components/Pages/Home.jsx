import React from 'react';
import socket from '../../socket.js'
import TreeMap from '../D3Graph/TreeMap.jsx'
import { miniJsonFiles, jsonFile, jsonFiles2, jsonFiles3 } from "../D3Graph/testData.js"

/**
 * Home Page
 * @author James Wake
 * @class Home
 */
export default class Home extends React.Component {
    //React Constructor
    constructor(...args){
        super(...args);
        this.state = {
            "home": "",
            "tree": miniJsonFiles
        }
    }
    //React on Mount
    componentDidMount(){
        socket.on("home", (data)=>{
            this.setState({"home": data});
        });
        socket.emit("home");
        socket.on('treemap', (data)=>{
            console.log("Recieving Tree: ", data);
            this.setState({"tree": data});
        });
        socket.emit('treemap', {collection: null, root: null});

        //Test for Graph rerender speed
        // this.interval = setInterval(()=>{
        //     let newHeight = this.state.graphHeight - 1;
        //     if(newHeight < 500) newHeight = 1060;
        //     this.setState({graphHeight: newHeight});
            
        // },20)
    }
    //React on Unmount
    componentWillUnmount(){
        socket.off("home");
        // clearInterval(this.interval);
    }

    updateRoot(elem){
        //console.log(elem);
        socket.on('treemap', (data)=>{
            console.log("Recieving Tree: ", data);
            this.setState({"tree": data});
            socket.off('treemap');
        });
        socket.emit('treemap', {collection: null, root: elem.data.path});
    }

    render() {
        return(
            <div className="PageContainer">
                <h1>{this.state.home}</h1>
                <TreeMap data={this.state.tree} updateRoot={this.updateRoot} type="json" className="treeMap"/>
            </div>
        );
	}
};
