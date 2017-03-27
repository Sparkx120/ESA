import React from 'react';
import Filter from './Filter.jsx';
import DemoTree from './treebeard/example/app.js';
// import Treebeard from './treebeard/lib/index';
import scss from '../../styles/filesystem.scss';

class FileSystem extends React.Component{
    // componentDidMount(){
    //     debugger;
    //     console.log(this.props.state);
    // }

// {/*data={this.props.state.dataStack[this.props.state.dataStack.length-1]}*/}
    render(){
        return(
            <div id='fileSys'>
                <h2 className='title'>File System</h2>
                <hr/>
                <Filter state={this.props.state} action={this.props.action}/>
                <hr/>
                {/*<DemoTree data={this.props.state.dataStack[this.props.state.dataHeight-1]}/>    */}

                <DemoTree data={this.props.state}/>
            </div>
        )
    }
}
export default FileSystem;