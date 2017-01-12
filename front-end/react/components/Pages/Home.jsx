import React from 'react';
import socket from '../../socket.js'
import TreeMap from '../D3Graph/TreeMap.jsx'
import { csvData } from '../D3Graph/testData.js'
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
            graphWidth: 960,
            graphHeight: 1060
        }
    }
    //React on Mount
    componentDidMount(){
        socket.on("home", (data)=>{
            this.setState({"home": data});
        });
        socket.emit("home");

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

    render() {
        return(
            <div className="PageContainer">
                <h1>{this.state.home}</h1>
                <TreeMap data={csvData} className="treeMap"/>
            </div>
        );
	}
};
