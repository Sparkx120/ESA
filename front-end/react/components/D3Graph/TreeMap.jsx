import React from "react";
import { csvData } from "./testData.js"
import { generateUUID } from "../utils.js"

/**
 * TreeMap Graph Component
 * @author James Wake
 * @class App
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
        let dim = this.getComponentDimensions();
        this.setState({size: dim});
        this.setupBaseD3();
        this.renderTreeMap(dim);
        this.configureResizeCallback();
    }

    /**
     * On Resize callback for TreeMap
     */
    componentResize(){
        if(this.timeout){
            clearTimeout(this.timeoout);
        }
        this.timeout = setTimeout(()=>{
            let dim = this.getComponentDimensions();
            //this.setState({size:dim});
            this.renderTreeMap(dim, true);
            this.timeout = null;
        }, 100);
    }

    configureResizeCallback(){
        //Update with compositable code
        window.onresize = ()=>{this.componentResize()};
    }

    render() {
        if(this.props.accordianScaling){
            console.log("Scaling from split view detected");
            this.componentResize();
        }
        return(
            <div id={this.state.id + "-container"} className="treemap-container">
                <svg id={this.state.id} width="100%" height="100%"></svg>
            </div>
        );
	}

    /**
     * Setup basic d3 functions that do not need size or data
     */
    setupBaseD3(){
        //D3 Format
        this.d3.format = d3.format(",d");

        //D3 Color Generator
        this.d3.color = d3.scaleOrdinal()
            .range(d3.schemeCategory10
                .map((c)=>{ c = d3.rgb(c); c.opacity = 0.6; return c; }));

        //D3 Data Stratification Function
        this.d3.stratify = d3.stratify()
            .parentId((d)=>{ return d.id.substring(0, d.id.lastIndexOf(".")); });
    }

    /**
     * Sets up the TreeMap using the D3 Library
     */
    renderTreeMap(dim, isUpdate){
        console.log(this.state.size);
        
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
            .padding(1)
            .round(true);
        
        //Parse the csvData into d3 format
        this.d3.data = d3.csvParse(this.props.data, (d)=>{d.value = +d.value;return d;});
        
        //Stratify the Data using the Stratification Funciton
        this.d3.root = this.d3.stratify(this.d3.data)
            .sum((d)=>{ return d.value; })
            .sort((a, b)=>{ return b.height - a.height || b.value - a.value; });
        
        //Remove All Previous Nodes on Rerender (Functionality needs to be broken up)
        d3.select(`#${this.state.id}`)
            .selectAll("*").remove();
        
        //Generate the Treemap and Render it to the target div
        this.d3.treemap(this.d3.root);
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
            .style("fill", (d)=>{ while (d.depth > 1) d = d.parent; return this.d3.color(d.id); })
	        .style("stroke", (d)=>{ return "transparent"})
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
            .text((d)=>{ return d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g).join("\n"); })
        //Box Size Text
        clip.append("text")
            .attr("class", "node-value")
            .attr("x", (d)=>{return 2;})
            .attr("y", (d)=>{return d.y1 - d.y0 - 6;})
            .text((d)=>{ return this.d3.format(d.value); });
        //Tool Tip
        g.append("svg:title")
            .text((d)=>{ return d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g).join("\n") + "\n" + this.d3.format(d.value);})
    }
};
