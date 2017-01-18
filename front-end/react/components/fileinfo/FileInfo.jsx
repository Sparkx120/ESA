import React from 'react';
import ReactDOM from 'react-dom';
import scss from '../../styles/fileinfo.scss';
import FileData from './FileData.jsx';

class FileInfo extends React.Component{
    render(){
        return(
            <div id="fileInfo">
                <h2>System Information</h2>
                <hr/>
                 
                <div className='infoTable'>
                    <table>
                        <tbody>
                            <tr>
                             <td>name</td>
                             <td>size</td>
                             <td>create date</td>
                             <td>mod date</td>
                             </tr>
                        </tbody>
                    </table>
                </div>
                 <FileData/>  
            </div>
        )
    }
}
export default FileInfo;