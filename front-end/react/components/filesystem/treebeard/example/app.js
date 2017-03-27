'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { StyleRoot } from 'radium';
import {Treebeard, decorators} from '../lib/index';

import data from './data';
import styles from './styles';  
import * as filters from './filter';
import FaSearch from 'react-icons/lib/fa/search';

import { handleFilters } from '../../../../filters/filters.jsx';

const HELP_MSG = 'Select A Node To See Its Data Structure Here...';
var DataTransform = require("node-json-transform").DataTransform;

export default class DemoTree extends React.Component {
    constructor(props){
        super(props);
        // debugger;
        // console.log("haha: " + this.props.props);
        
        this.state = {
            data
        }

        this.onToggle = this.onToggle.bind(this);
    }



    //click the root folder to show the sub folders
    onToggle(node, toggled){
        if(this.state.cursor){this.state.cursor.active = false;}
        node.active = true;
        if(node.children){ node.toggled = toggled; }
        this.setState({ cursor: node });
        
        //console.log("in app.js: "+this.state.data);
        //console.log("extend the file tree structure");
    }
    //search the folder/file by name
    onFilterMouseUp(e){
        const filter = e.target.value.trim();
        if(!filter){ return this.setState({data}); }
        var filtered = filters.filterTree(data, filter);
        filtered = filters.expandFilteredNodes(filtered, filter);
        this.setState({data: filtered});

        //console.log("search the file system by name");
    }

    //Transform local subtree to correct format
    transformData(input, nextProps, prevRoot){
        let filters = null;
        if(nextProps && nextProps.data){
            filters = nextProps.data.filters ? nextProps.data.filters : null;
        }

        let newb = {toggled:false};
        let f;
        
        // if(input.path.indexOf("undefined/") < 0){
            for (f in input ) {
                if (f == 'path' ) {
                    let name = input[f];
                    if(prevRoot && prevRoot != "."){
                        name = name.substring(prevRoot.length);
                    }
                    newb.name = name;
                } else { 
                    if(f!='id'){
                        newb[f]=input[f]
                    }
                }
            }

            if (input.children && input.children.length){
                newb.children = [];
                for ( var i = 0; i < input.children.length; ++i ){
                    let newChild = this.transformData(input.children[i], nextProps , (prevRoot != "." ? prevRoot : "") + newb.name);
                    let shouldAdd = true;
                    
                    if(filters){
                        if(!handleFilters(filters, newChild)){
                            shouldAdd = false;
                        }
                    }
                    
                    // else{
                    if(newChild && shouldAdd){
                        newb.children.push(newChild);
                    }
                    // }
                }
            }
        // }
        // else{
        //     return null;
        // }
        
        return newb;
    }

    componentDidMount(){
        // debugger;
        //console.log("from app.js didmount: " + this.props.data);
        //console.log(this.props.data);   
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data && nextProps.data.dataHeight>0) {
            var data=nextProps.data.dataStack[nextProps.data.dataHeight-1];
            //console.log('######## in componentWillReceiveProps datastack:',data);
            data = this.transformData(data, nextProps, data.path);
            // console.log('######## in componentWillReceiveProps after transform:',data);
            //console.log('in componentWillReceiveProps test data:',testd);
            data.toggled = true;
            this.setState({data:data});
        }
        // console.log('######## in componentWillReceiveProps nextProps:',nextProps);
        // console.log('######## in componentWillReceiveProps passed down data',this.props.data);
        
        
    }

    // componentResize(){
    //     debugger;
    //     console.log(this.props.data);
    // }

    // componentWillReceiveProps(nextProps){
    //     debugger;
    //     console.log(this.props.data);
    // }

    render(){

        return (
            <StyleRoot>
                {/*<div style={styles.searchBox}>
                    <div className="input-group">
                        <span className="input-group-addon">
                            <FaSearch/>
                        </span>
                        <input type="text"
                            className="form-control"
                            placeholder="Search the directory tree..."
                            onKeyUp={this.onFilterMouseUp.bind(this)}
                        />
                    </div>
                </div>*/}
                <p><b>File System Browser</b></p>
                <div style={styles.component}>
                    <Treebeard
                        data={this.state.data}
                        onToggle={this.onToggle}
                        decorators={decorators}
                    />
                </div>
                <div style={styles.component}>
                    <NodeViewer node={this.state.cursor}/>
                </div>
            </StyleRoot>

        );
    }
}

// Example: Customising The Header Decorator To Include Icons
decorators.Header = (props) => {
    const style = props.style;
    const iconType = props.node.children ? 'folder' : 'file-text';
    const iconClass = `fa fa-${iconType}`;
    const iconStyle = { marginRight: '5px' };
    return (
        <div style={style.base}>
            <div style={style.title}>
                <i className={iconClass} style={iconStyle}/>
                {props.node.name}
            </div>
        </div>
    );
};


//view the detailed file info
class NodeViewer extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        const style = styles.viewer;

        var minProp = Object.assign({}, this.props.node);
        delete minProp.children;

        let json = JSON.stringify(minProp, null, 4);
        if(!json){ json = HELP_MSG; }
        return (
            <div style={style.base}>
                {json}
            </div>
        );
    }
}

NodeViewer.propTypes = {
    node: React.PropTypes.object
};

// const content = document.getElementById('file-structure');
// ReactDOM.render(<DemoTree/>, content);
