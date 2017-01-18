import React from 'react';
import TreeMap from './TreeMap.jsx';
import DonutChart from './DonutChart.jsx';
import scss from '../../styles/graph.scss';

class Graphs extends React.Component{
    render(){
        return(
            <div id="graphs">
                <h2>Graphs</h2>
                <hr/>
                <div id="graph-box">
                    <TreeMap/>
                    <DonutChart/>
                </div>
            </div>
        )
    }
}
export default Graphs;