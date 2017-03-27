import React from 'react';
import { Link } from 'react-router';
import FilterOpt from './FilterOpt.jsx';
// import FilterForm from './FilterOptExample.jsx';
import FaAngleDoubleDown from 'react-icons/lib/fa/angle-double-down';

class Filter extends React.Component{
    render(){
        return(
            <div id='filter'>
                <form action="">
                {/*<div className="input-group">*/}
                    <p><b>Completed Scans</b></p>
                    <select className="form-control" value={this.props.state.collection ? this.props.state.collection : ""} onChange={(ev)=>this.props.action('SET_COLLECTION', ev.target.value)}>
                        {this.props.state.collections.map((collection, idx)=>{
                            return(
                                <option key={idx} value={collection ? collection.name : ""} defaultValue={collection == this.props.state.collection}>
                                    {collection ? collection.name : ""}
                                </option>
                            );
                        })}
                    </select>
                    {/*<input type="text" className="form-control" placeholder="choose the server: //"/>
                    <div className="input-group-addon"><FaAngleDoubleDown/></div>*/}
                {/*</div>*/}
                {/*
                Version2 
                <div class="dropdown">
                <button onclick="myFunction()" class="dropbtn">Dropdown</button>
            <div id="myDropdown" class="dropdown-content">
             <input type="text" placeholder="Search.." id="myInput" onkeyup="filterFunction()"/>
             <Link href="">About</Link>
            </div>
            </div>*/}

                <p><b>Filters</b></p>
                <div id="filter-box">
                    <FilterOpt state={this.props.state} action={this.props.action}/>
                </div>

                </form>
           
            </div>
        )
    }
}
export default Filter;

