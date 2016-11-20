import React from 'react';
import socket from '../../socket.js'

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
            "home": ""
        }
    }
    //React on Mount
    componentDidMount(){
        socket.on("home", (data)=>{
            this.setState({"home": data});
        });
        socket.emit("home");
    }
    //React on Unmount
    componentWillUnmount(){
        socket.off("home");
    }

    render() {
        return(
            <div className="PageContainer">
                    <h1>{this.state.home}</h1>
            </div>
        );
	}
};
