import React from 'react';
import socket from '../../socket.js'
import TreeMap from '../D3Graph/TreeMap.jsx'
import { csvData } from '../D3Graph/testData.js'

class Graphs extends React.Component{
     //React Constructor
    constructor(...args){
        super(...args);
        this.state = {
            "home": "",
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
    render(){
        return(
            <div id="graphs">
                <h2>Graphs</h2>
                <hr/>
                <div id="graph-box">
                    <h3>{this.state.home}</h3>
                    <TreeMap accordianScaling={this.props.accordianScaling} data={csvData} className="treeMap"/>
                </div>
            </div>
        )
    }
}
export default Graphs;