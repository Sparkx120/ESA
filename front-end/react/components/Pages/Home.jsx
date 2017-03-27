import React from 'react';
import socket from '../../socket.js'
import TreeMapControl from '../D3Graph/TreeMapControl.jsx'
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
            home: "",
            tree: null,
            dataStack: []
        }
    }
    //React on Mount
    componentDidMount(){
        socket.on('treemap', (data)=>{
            console.log("Recieving Tree: ", data);
            this.setState({dataStack: [data]});
            socket.off('treemap');
        });
        socket.emit('treemap', {collection: null, root: null});

        //Test for Graph rerender speed
        // this.interval = setInterval(()=>{
        //     let newHeight = this.state.graphHeight - 1;
        //     if(newHeight < 500) newHeight = 1060;
        //     this.setState({graphHeight: newHeight});
            
        // },20)
    }

    updateRoot(elem){
        this.setState({tree: null})
        socket.on('treemap', (data)=>{
            console.log("Recieving Tree: ", data);
            
            //Back Stack
            let localStack = this.state.dataStack;
            localStack.push(data);

            //Set State
            this.setState({dataStack: localStack});
            socket.off('treemap');
        });
        socket.emit('treemap', {collection: null, root: elem.data.path});
    }

    upRoot(){
        let localStack = this.state.dataStack;
        localStack.pop();
        this.setState({dataStack: localStack});
    }

    render() {
        return(
            <div className="PageContainer">
                <TreeMapControl dataHeight={this.state.dataStack.length} data={this.state.dataStack[this.state.dataStack.length-1]} updateRoot={this.updateRoot.bind(this)} upRoot={this.upRoot.bind(this)} type="json" className="treeMap"/>
            </div>
        );
	}
};
