import React from 'react';
import FilterOpt from './FilterOpt.jsx';
// import FilterForm from './FilterOptExample.jsx';
import FaAngleDoubleDown from 'react-icons/lib/fa/angle-double-down';

class Filter extends React.Component{
    render(){
        return(
            <div id='filter'>
                <div className="input-group">
                    <input type="text" className="form-control" placeholder="enter the directory here"/>
                    <span className="input-group-addon"><FaAngleDoubleDown/></span>  
                </div>
                <p><b>filter by:</b></p>
                <FilterOpt/>
           
            </div>
        )
    }
}
export default Filter;

