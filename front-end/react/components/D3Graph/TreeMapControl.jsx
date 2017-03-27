import React from "react";
import Loader from "react-loader";
import TreeMap from "./TreeMap.jsx";
import { setKeyCallback,
         deleteKeyCallback } from "../../containers/callbackblock.jsx"


/**
 * TreeMapControl TreeMap with controls Component
 * @author James Wake
 * @class TreeMapControl
 */
export default class TreeMapControl extends React.Component {
	constructor(props){
        super(props);

		this.state = {
			dirOnly: false,
			maxFiles: true,
			maxFilesNumber: 128,
			everything: false,

			cDepth: true,
			cFile: false,
			cFileType: "",
			cServer: false,

			loaded: false
		}
    }

	componentDidMount(){
        this.configureKeyCallback();
    }

	componentWillUnmount(){
        deleteKeyCallback("TreemapControl");
    }

	/**
     * Configure the Key Up callback
     * @class TreeMapControl
     */
    configureKeyCallback(){
        setKeyCallback("TreemapControl", (e)=>{
			// console.log(e);
            if(e.keyCode == 188 && e.ctrlKey && this.props.state.dataHeight > 1){
				// console.log("Going up");
				this.props.action('GO_UP_TREE')
			}
			// else{
			// 	console.log("Can't go up");
			// }
        });
    }

	render(){
		//Unwrap State Variables for easier readablity
		const displayMode = this.props.state.displayMode;
		const colorMode = this.props.state.colorMode;

		return(
			<div className="TreeMapControl">
				<Loader loaded={!this.props.state.loading}>
					<input className="treeBack" type="button" title="Ctrl + ," value="Previous Root"  onClick={()=>this.props.action('GO_UP_TREE')} disabled={!(this.props.state.dataHeight > 1)}/>
					<span> Root {this.props.state.root} </span>
					{/*different from how I get data in the FileSystem section*/}
					<TreeMap state={this.props.state} data={this.props.state.dataStack[this.props.state.dataHeight-1]} updateRoot={(elem)=>this.props.action('GET_TREE', elem)} upRoot={()=>this.props.action('GO_UP_TREE')} type={this.props.type} accordionScaling={this.props.accordionScaling}/>
				</Loader>
				
				<div className="TreeMapControls">
					<div className="floatLeft rightMarginSmall">
						<h3>Display Mode</h3>
						<span>
							<input type="radio" checked={displayMode.directoryOnly.set} onChange={()=>this.props.action('CHANGE_DISPLAY_MODE', {type:'dirOnly'})}/>Directories Only
							<input type="radio" checked={displayMode.maximumFiles.set} onChange={()=>this.props.action('CHANGE_DISPLAY_MODE', {type:'maxFiles', value:displayMode.maximumFiles.value})}/>Maximum Files:&nbsp;
							<input type="text" value={displayMode.maximumFiles.value} onChange={(ev)=>this.props.action('CHANGE_DISPLAY_MODE', {type:'maxFiles', value:ev.target.value})} placeholder="128"/>
							<input type="radio" checked={displayMode.everything.set} onChange={()=>this.props.action('CHANGE_DISPLAY_MODE', {type:'everything'})}/>Everything
						</span>
					</div>
					<div className="floatLeft">
						<h3>Color Mode</h3>
						<span>
							<input type="radio" checked={colorMode.depth.set} onChange={()=>this.props.action('CHANGE_COLOR_MODE', {type:'depth'})} name="cDepth"/>Depth
							<input type="radio" checked={colorMode.fileType.set} onChange={()=>this.props.action('CHANGE_COLOR_MODE', {type:'fileType', value:colorMode.fileType.value})} name="cFile"/>File Type:&nbsp;
							<input type="text" value={colorMode.fileType.value} onChange={(ev)=>this.props.action('CHANGE_COLOR_MODE', {type:'fileType', value:ev.target.value})} placeholder="\.html$ (Javascript regex)"/>
							<input type="radio" checked={colorMode.serverConfig.set} onChange={()=>this.props.action('CHANGE_COLOR_MODE', {type:'server_defined'})} name="cServer"/>Use Server Config
						</span>
					</div>
				</div>
			</div>
		)
	}
}