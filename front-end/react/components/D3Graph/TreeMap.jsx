import React from "react";
import { generateUUID } from "../utils.js"
import { setResizeCallback,
         deleteResizeCallback } from "../../containers/callbackblock.jsx"

import { handleFilters, isFiltering } from "../../filters/filters.jsx"

const DEBUG = false;
const DIV = true;

//Used for FileType Highlight colorMode
const HIGHLIGHT = "rgba(189,188,34,0.6)";
const BACKGROUND = "rgba(127,127,127,0.6)";

/**
 * TreeMap Graph Component
 * @author James Wake
 * @class TreeMap
 */
export default class TreeMap extends React.Component {

    constructor(props){
        super(props);
        this.d3 = {
            treemap: null,
            color: null,
            stratify: null,
            format: null,
            root: null,
            data: null
        }
        this.state = {
            id: generateUUID("TreeMap"),
            size: {width: 960, height:1060}
        }

        this.timeout = Date.now();
    }

    /**
     * Get the dimensions of the current containing div
     * @class TreeMap
     */
    getComponentDimensions(){
        //Use a square box representation with a 1x1 factor then resize to fit in the next phase using div.clientWidth
        //var divWidth = document.getElementById("mydiv").clientWidth;
        let divWidth = document.getElementById(this.state.id + "-container").clientWidth;
        let divHeight = document.getElementById(this.state.id + "-container").clientHeight;
        let divLeft = document.getElementById(this.state.id + "-container").clientLeft;
        let divTop = document.getElementById(this.state.id + "-container").clientTop;
        return {width: divWidth, height:divHeight, top:divTop, left: divLeft}   
    }

    componentDidMount(){
        // debugger;
        let dim = this.getComponentDimensions();
        this.setState({size: dim});
        this.setupBaseD3();
        this.renderTreeMap(dim);
        this.configureResizeCallback();
    }

    componentWillUnmount(){
        //setResizeCallback(this.state.id, ()=>{});
        deleteResizeCallback(this.state.id);
    }

    /**
     * On Resize callback for TreeMap
     * @class TreeMap
     */
    componentResize(){
        if(this.timeout){
            clearTimeout(this.timeoout);
        }
        this.timeout = setTimeout(()=>{
            let dim = this.getComponentDimensions();
            //this.setState({size:dim});
            this.renderTreeMap(dim, true);
            // this.timeout = null;
        }, 20);
    }

    componentWillReceiveProps(nextProps){
        this.renderTreeMap(null, true, nextProps);
    }

    /**
     * Configure the Resize Callback
     * @class TreeMap
     */
    configureResizeCallback(){
        //Update with compositable code
        setResizeCallback(this.state.id, ()=>{this.componentResize()});
    }

    render() {
        if(this.props.accordionScaling){
            if(DEBUG) console.log("Scaling from split view detected");
            this.componentResize();
        }
        let DebugInfo = (<p></p>);
        if(DEBUG){
            DebugInfo = (<p>
                    DataSize: {this.dataSize} <br/>
                    Processing Time: {this.dataprocessingTime} <br/>
                    Render Time: {this.renderTime} <br/>
                </p>)
        }

        //Switch between SVG and DIV tag mode
        let TreeMapOut = <svg id={this.state.id} className="treeMap"></svg>;
        if(DIV){
            TreeMapOut = <div id={this.state.id} className="treeMap"></div>;
        }


        return(
            <div id={this.state.id + "-container"} className="treemapContainer">
                {TreeMapOut}
                <div>
                    {DebugInfo}
                </div>
            </div>
        );
	}

    /**
     * Setup basic d3 functions that do not need size or data
     * @class TreeMap
     */
    setupBaseD3(){
        //D3 Format
        this.d3.format = d3.format(",d");

        //D3 Color Generator
        this.d3.color = d3.scaleOrdinal()
            .range(d3.schemeCategory10.map((c)=>{ c = d3.rgb(c); c.opacity = 0.6; return c; }));
        
        //D3 Linear Color Generator
        // this.d3.color = d3.scale.linear()
        //     .range(['lightgreen', 'darkgreen']) // or use hex values
        //     .domain([0, Infinity]);

        //D3 Data Stratification Function
        this.d3.stratify = d3.stratify()
            .parentId((d)=>{ return d.id.substring(0, d.id.lastIndexOf(".")); });
    }

    /**
     * Sets up the TreeMap Data using the D3 Library
     */
    renderTreeMap(dim, isUpdate, nextProps){
        if(DEBUG) console.log(this.state.size);
        this.dataprocessingTime = Date.now();

        //Handle Props Updates
        let type = nextProps ? nextProps.type : this.props.type;
        let data = nextProps ? nextProps.data : this.props.data;

        //Define Dimensions
        // var width = this.props.size.width,
        // height = this.props.size.height;
        let width = this.state.size.width;
        let height = this.state.size.height;
        if(dim){
            width = dim.width;
            height = dim.height;
        }

        //D3 Tree Map definition
        this.d3.treemap = d3.treemap()
            .size([width, height])
            .padding(0)
            .round(true);
        
        //CSV Parser
        if(type == "csv"){
            //Parse the csvData into d3 format
            this.d3.data = d3.csvParse(data, (d)=>{d.value = +d.value;return d;});
            
            //Stratify the Data using the Stratification Funciton
            this.d3.root = this.d3.stratify(this.d3.data)
                .sum((d)=>{ return d.value; })
                .sort((a, b)=>{ return b.height - a.height || b.value - a.value; });
        }

        //Json Data parser
        else if(type == "json"){
            //Json Data Hierarchy Generator for ESA data
            this.d3.root = d3.hierarchy(data)
                .eachBefore((d)=>{ d.data.id = (d.parent ? d.parent.data.id + "/" : "") + d.data.id; })
                .sum((d)=>{ if(d.size) return d.size; else return 0})
                .sort((a, b)=>{ return b.height - a.height || b.value - a.value; });
               
                // console.log("hahaha");
                // console.log(this.d3.root);
                // console.log("hehehe");
        }

        //Set dataSize (The number of nodes in the tree)
        this.dataSize = 0;
        this.d3.root.each((d)=>this.dataSize += 1);

        //Remove All Previous Nodes on Rerender (Functionality needs to be broken up)
        d3.select(`#${this.state.id}`)
            .selectAll("*").remove(); //This is not working right

        this.dataprocessingTime = Date.now()-this.dataprocessingTime;
        this.renderTime = Date.now();

        //Render the Elements to the DOM
        if(DIV){
            if(isUpdate){
                this.createDIVTree(nextProps);
                //this.updateDIVTree(); //Not working quite right
            }
            else{
                this.createDIVTree(nextProps);
            }
        }
        else{
            if(isUpdate){
                this.createSVGTree(nextProps);
                //this.updateSVGTree(); //Not working quite right
            }
            else{
                this.createSVGTree(nextProps);
            }
        }

        this.renderTime = Date.now()-this.renderTime;
        if(DEBUG) console.log(this.dataprocessingTime, this.renderTime, this.dataSize);
    }

    /**
     * Generate the Treemap as an SVG on the DOM in the target div
     * @class TreeMap
     * @param {Object} nextProps
     */
    createSVGTree(nextProps){
        let type = nextProps ? nextProps.type : this.props.type;

        this.d3.treemap(this.d3.root);
        if(DEBUG) console.log(this.d3);
        let g = d3.select(`#${this.state.id}`)
            .selectAll(".node")
            .data(this.d3.root.leaves())
            .enter().append("g")
        //Treemap Boxes
        let box = g.append("rect")
            .attr("class", "node")
            .attr("title", (d)=>{ return d.id + "\n" + this.d3.format(d.value); })
            .attr("x", (d)=>{ return d.x0; })
            .attr("y", (d)=>{ return d.y0; })
            .attr("width", (d)=>{ return d.x1 - d.x0; })
            .attr("height", (d)=>{ return d.y1 - d.y0; })
            .style("fill", (d)=>{ while (d.depth > 2) d = d.parent; return this.d3.color(d.value); })
	        .style("stroke", "white" /*"transparent"*/)
        //Text Cliping Box
	    let clip = g.append('svg')
            .attr("x", (d)=>{ return d.x0; })
            .attr("y", (d)=>{ return d.y0; })
            .attr("width", (d)=>{ return d.x1 - d.x0; })
            .attr("height", (d)=>{ return d.y1 - d.y0; })
            .style("overflow", "hidden")
        //Box Title Text
        clip.append("text")
            .attr("class", "node-label")
	        .attr("x", (d)=>{return 2;})
	        .attr("y", (d)=>{return 14;})
            .text((d)=>{ if(type=="json") return d.data.path; else return d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g).join("\n"); })
        //Box Size Text
        clip.append("text")
            .attr("class", "node-value")
            .attr("x", (d)=>{return 2;})
            .attr("y", (d)=>{return d.y1 - d.y0 - 6;})
            .text((d)=>{ return this.d3.format(d.value); });
        //Tool Tip
        g.append("svg:title")
            .text((d)=>{ if(type=="json") return d.data.path; else return d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g).join("\n") + "\n" + this.d3.format(d.value);})
    }

    /**
     * Update an SVG TreeMap Tree with updated nodes
     * @class TreeMap
     * @param {Object} nextProps 
     */
    updateSVGTree(nextProps){
        let type = nextProps ? nextProps.type : this.props.type;

        d3.select(`#${this.state.id}`)
            .selectAll(".node")
            .data(this.d3.root.leaves())
            .attr("x", (d)=>{ return d.x0; })
            .attr("y", (d)=>{ return d.y0; })
            .attr("width", (d)=>{ return d.x1 - d.x0; })
            .attr("height", (d)=>{ return d.y1 - d.y0; })

        d3.select(`#${this.state.id}`)
            .selectAll(".node-value")
            .data(this.d3.root.leaves())
            .attr("x", (d)=>{return 2;})
            .attr("y", (d)=>{return d.y1 - d.y0 - 6;})    
    }

    /**
     * Create a DIV TreeMap
     * @class TreeMap
     * @param {Object} nextProps
     */
    createDIVTree(nextProps){
        let type = nextProps ? nextProps.type : this.props.type;
        
        this.d3.treemap(this.d3.root);
        let divSelection = d3.select(`#${this.state.id}`)
            .selectAll(".node")
            .data(this.d3.root.leaves())
        
        //Treemap Boxes
        let bW = 0.5;
        let box = divSelection.enter().append("div").attr("class", "node")
            .attr("title", (d)=>{ return d.data.path + "\n" + this.d3.format(d.value); }) //Tooltip
            .style("left", (d) => { return d.x0 + "px"; })
            .style("top", (d) => { return d.y0 + "px"; })
            .style("width", (d) => { if(d.x1 - d.x0 - 2*bW>0) return d.x1 - d.x0 - 2*bW + "px"; else return "0px"; })
            .style("height", (d) => { if(d.y1 - d.y0 - 2*bW>0) return d.y1 - d.y0 - 2*bW  + "px"; else return "0px" })
            //Color Handler
            .style("background", (d) => {return this.colorize(d,nextProps ? nextProps : this.props)})
            .style("border", ""+ bW +" white")
            .on("click", (elem)=>{
                if(elem.data.isFolder){
                    this.props.updateRoot(elem);
                }else{
                    this.props.updateRoot({data:{path:elem.parent.data.path}});
                }
                
            });
            // .on("contextmenu", (elem)=>{
            //     this.props.upRoot()
            // });
        //Title
        box.append("div")
            .attr("class", "node-label")
            .text((d) => { if(type=="json") return d.data.path.substring(d.parent ? d.parent.data.path.length : 0); else return d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g).join("\n"); })
        //Value
        box.append("div")
            .attr("class", "node-value")
            .style("left", (d)=>4)
            .style("top", (d)=>{return d.y1 - d.y0 - 40;})
            .text((d) => { let size = Math.floor(d.value/1000000); return size + " MB"; });
    }

    /**
     * Update a DIV TreeMap Tree with updated nodes
     * @class TreeMap
     * @param {Object} nextProps 
     */
    updateDIVTree(nextProps){
        let bW = 0.5;
        d3.select(`#${this.state.id}`)
            .selectAll(".node")
            .data(this.d3.root.leaves())
            .style("left", (d) => { return d.x0 + "px"; })
            .style("top", (d) => { return d.y0 + "px"; })
            .style("width", (d) => { if(d.x1 - d.x0 - 2*bW>0) return d.x1 - d.x0 - 2*bW + "px"; else return "0px"; })
            .style("height", (d) => { if(d.y1 - d.y0 - 2*bW>0) return d.y1 - d.y0 - 2*bW  + "px"; else return "0px" })
        
        d3.select(`#${this.state.id}`)
            .selectAll(".node-value")
            .data(this.d3.root.leaves())
            .style("left", (d)=>4)
            .style("top", (d)=>{return d.y1 - d.y0 - 40;})
    }

    /**
     * Colorize a tile in the treemap based on its d3 component and the nextProps colorMode
     * @param {Object} d 
     * @param {Object} nextProps 
     */
    colorize(d, nextProps){
        let color = nextProps ? nextProps.state.colorMode : {depth:{set:true}};
        let filters = nextProps ? nextProps.state.filters : null;
        // console.log(color, nextProps, color.depth.set);

        if(filters && isFiltering(filters)){
            if(handleFilters(filters, d.data)){
                return HIGHLIGHT;
            }
            else{
                return BACKGROUND;
            }
            // let size = d.data.size;
            // if(d.data.folderSize){
            //     size = d.data.folderSize;
            // }
            // //console.log(parseInt(size) > parseInt(filters.size.value)*1000000, parseInt(filters.size.value), filters.size.value)
            // if(parseInt(size) > filters.size.value*1000000){
            //     return HIGHLIGHT;
            // }
            // else{
            //     return BACKGROUND;
            // }
        }

        //Handle Color Modes
        if(color.depth.set){
            // console.log("This was done");
            while (d.depth > 2) d = d.parent;
            return this.d3.color(d.value); 
        }
        if(color.fileType.set){
            //console.log(d);
            try{
                let regex = new RegExp(color.fileType.value);
                // console.log(d);
                if(regex.exec(d.data.path)){
                    return HIGHLIGHT;
                }
                else{
                    return BACKGROUND;
                }
            }catch(e){
                // console.log(e);
                return BACKGROUND;
            }
            
        }
        if(color.serverConfig){
                //Not implemented
        }

        return "rgba(0,0,0,1)"; //ERROR IF YOU GET THIS
    }
};