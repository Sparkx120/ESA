import React from 'react';
import ReactDOM from 'react-dom';
//filter
import {Slider, Toggle} from 'react-filters/dist';
import CollapseOpt from './CollapseOpt.jsx';
import FaAngleDoubleDown from 'react-icons/lib/fa/angle-double-down';
import DatePicker from 'react-datepicker';
import scss from 'react-datepicker/dist/react-datepicker.scss';


class FilterOpt extends React.Component{

      constructor(props){
            super(props);
            this.state = {
                  dropdownIsActive: false,
                  dropdownIsVisible: false,
            }
            this.sizeDropdown = this.sizeDropdown.bind(this);
            this.nameDropdown = this.nameDropdown.bind(this);
            this.cDateDropdown = this.cDateDropdown.bind(this);
            this.mDateDropdown = this.mDateDropdown.bind(this);
      };

      sizeDropdown(){
            var size = this.refs.filesizeOPT;
            var x = this.refs.opt1;
            if(size.checked){
                  x.className = 'show-more-options';
            }
            else{
                  x.className = 'hide';
            }
      }
      nameDropdown(){
            var name = this.refs.filenameOPT;
            var x = this.refs.opt2;
            if(name.checked){
                  x.className = 'input-group';
                  // x.style.width: 100%
            }
            else{
                  x.className = 'hide';
            }
      }

      cDateDropdown(){
            var cDate = this.refs.createdateOPT;
            var x = this.refs.opt3;
            if(cDate.checked){
                  x.className = 'calendar';
            }
            else{
                  x.className = 'hide';
            }
      }

      mDateDropdown(){
            var mDate = this.refs.modifydateOPT;
            var x = this.refs.opt4;
            if(mDate.checked){
                  x.className = 'calendar';
            }
            else{
                  x.className = 'hide';
            }
      }

    render(){
        return(
         <div id='filter-options'>
            <div className='filter-opt'>
               <label>
                  <input ref='filesizeOPT' className='ckeckbox' type="checkbox" value="file size" onChange={this.sizeDropdown}/>file size          
               </label>
               <div className='hide' ref='opt1'>
                  
                 <form action="">
                  <input type="radio" name='gender' value='max'/>max <br/>
                  <input type="radio" name='gender' value='min'/>min <br/>
                 </form>
               </div>
               
            </div>
      
            <div className='filter-opt'>
                  <label>
                        <input ref='filenameOPT' type="checkbox" value="file name" onChange={this.nameDropdown}/>file name
                  </label>
                  <div className="hide" ref='opt2'>
                        <input type="text" className="form-control" placeholder="enter dir name"/>
                        <span className="input-group-addon"><FaAngleDoubleDown/></span>  
                  </div>
            </div>
          
            <div className="filter-opt">
                  <label>
                   <input ref='createdateOPT' type="checkbox" value="create date" onChange={this.cDateDropdown}/>create date
                  </label>
                  <div className="hide" ref='opt3'>
                  <input type="text" className='react-datepicker-ignore-onclickoutside' value='01/01/2017'/>
                  <DatePicker inline selected={this.state.startDate} onChange={this.handleChange}/>
                  </div>
            </div>
 
           <div className="filter-opt">
                  <label>
                        <input ref='modifydateOPT' type="checkbox" value="modify date" onChange={this.mDateDropdown}/>modify date
                  </label>
                  <div className='hide' ref='opt4'>
                        <input type="text" className='react-datepicker-ignore-onclickoutside' value='01/01/2017'/>
                        <DatePicker inline selected={this.state.startDate} onChange={this.handleChange}/>
                  </div>
            </div>

        </div>   
        )
    }
 
}
export default FilterOpt;