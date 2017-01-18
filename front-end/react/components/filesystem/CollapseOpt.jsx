import React from 'react';
import FaAngleDoubleDown from 'react-icons/lib/fa/angle-double-down';
import Calendar from 'react-input-calendar';

class CollapseOpt extends React.Component{
    constructor(props){
        super(props);
        
        this.state={}
    }
    
    render(){
        return(
            <div className='filter-collapse' ref=''>
                
                <div className='hide' ref='opt1'>
                  <label>
                    <input className='checkbox-max' type='checkbox' value='max'/>max
                  </label>
                  <br/>
                  <label>
                    <input className='checkbox-min' type='checkbox' value='min'/>min
                  </label>
               </div>
               <div className="hide" ref='opt2'>
                    <input type="text" className="form-control-name" placeholder="enter dir name"/>
                    <span className="input-group-addon"><FaAngleDoubleDown/></span>  
               </div>
               <div className="hide" ref='opt3'>
                    <Calendar format='DD/MM/YYYY' date='1-1-2017' />
               </div>
               <div className="hide" ref='opt4'>
                    <Calendar format='DD/MM/YYYY' date='1-1-2017' />
               </div>



            </div>
        );
    }
}
export default CollapseOpt;
