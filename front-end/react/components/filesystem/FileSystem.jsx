import React from 'react';
import Filter from './Filter.jsx';
import Status from './Status.jsx';
import scss from '../../styles/filesystem.scss';

class FileSystem extends React.Component{
    render(){
        return(
            <div id='fileSys'>
                <h2 className='title'>File System</h2>
                <hr/>
                <Filter/>
                <hr/>
                <Status/>
                
            </div>
        )
    }
}
export default FileSystem;