import React from 'react';
import socket from '../../socket.js'
import TreeMapControl from '../D3Graph/TreeMapControl.jsx';
import Style from '../../styles/graph.scss';

/**
 * Graphs Container Component
 * Converts Root to TreeMapControls
 * @author James Wake
 * @class Graphs
 */
export default class Graphs extends React.Component{
    render(){
        return(
            <div className="graphs">
                <h2>Graph</h2>
                <hr/>
                <div>
                    <TreeMapControl accordionScaling={this.props.accordionScaling} state={this.props.state} action={this.props.action} type="json" className="treeMap"/>
                </div>
            </div>
        )
    }
}