import React from 'react';
import ReactDOM from 'react-dom';
import SplitPane from './splitpane/SplitPane.jsx';
import Resizer from './splitpane/Resizer.jsx';

import scss from '../styles/accordion.scss';
import FileSystem from './filesystem/FileSystem.jsx';
import FileInfo from './fileinfo/FileInfo.jsx';
import Graphs from './graph/Graphs.jsx';

class Accordion extends React.Component{
    constructor(props){
        super(props);
        this.state = {}
       
    }

    render(){

        // const styleA = { background: '#eee' };
        // const styleB = { background: '#aaa4ba' };
        // const styleC = { background: '#000' };
        // const styleD = { padding: '2em', fontStyle: 'italic' };
        
        return(
//             {/*
         <SplitPane split="vertical" defaultSize="98%" maxSize="1260">
            <h1 id='welcome'>Welcome to 4J!!!</h1>
            <SplitPane split="vertical" defaultSize="33%" maxSize="1235">
                <FileSystem/>
                <SplitPane split="vertical" defaultSize="50%" maxSize="1210">
                    <FileInfo/>
                    <Graphs/>
                </SplitPane>
            </SplitPane>
         </SplitPane> 
//   */}
 
//   {/*
    // <SplitPane
    //         split="vertical"
    //         minSize={50} maxSize={350} defaultSize={100}
    //         className="primary"
    //         pane1Style={styleA}
    //         resizerStyle={styleC}>
    //         <FileSystem/>
    //         <SplitPane split="horizontal" paneStyle={styleD} pane2Style={styleB}>
    //             <FileInfo/>
    //             <Graphs/>
    //         </SplitPane>
    // </SplitPane>
//   */} 
        )
    }
}
export default Accordion;

