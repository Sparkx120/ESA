import React from 'react';
import ReactDOM from 'react-dom';
//filter
import {Slider, Toggle} from 'react-filters/dist';
import CollapseOpt from './CollapseOpt.jsx';
import FaAngleDoubleDown from 'react-icons/lib/fa/angle-double-down';
import DatePicker from 'react-datepicker';
import { Link } from 'react-router';
import Calendar from 'react-input-calendar';

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

   /*  render(){
        return(
         <div id='filter-options'>
            <div className='filter-opt'>
               <label>
                  <input ref='filesizeOPT' className='ckeckbox' type="checkbox" value="file size" onChange={this.sizeDropdown}/>file size          
               </label>
               <div className='hide' ref='opt1'>              
                  <input type="radio" name='gender' value='max'/>max <br/>
                  <input type="radio" name='gender' value='min'/>min <br/>
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
    }*/
 
 formatDate(date){
       return date.getMonth()+1 + '-' + date.getDate() + '-' + date.getFullYear();
 }

 //////////////////////version 2///////////////////
 render(){
       return(
             /*<div>
                  <ul>
                     <li className="filter-opt">
                        <label htmlFor="">
                              <input type="checkbox"/>file name
                        </label>
                    </li>
                    <br/>                 
                    <li className="filter-opt">
                        <label htmlFor="">
                              <input type="checkbox"/>file size
                        </label>
                        <ul>
                            <label>
                                <input type="radio" name="fileSize" value="max"/>max
                                <input type="radio" name="fileSize" value="min"/>min
                            </label> 
                        </ul>
                    </li>
                 </ul>
             </div>*/


            <div className="filter-opt">		
                 <table className="opt-table">
                  <tbody>
                        <tr>
                                    {/*<input type="checkbox" checked={displayMode.directoryOnly.set} onChange={()=>this.props.action('CHANGE_DISPLAY_MODE', {type:'dirOnly'})}/>File Name
                              <input type="radio" checked={displayMode.maximumFiles.set} onChange={()=>this.props.action('CHANGE_DISPLAY_MODE', {type:'maxFiles', value:displayMode.maximumFiles.value})}/>Maximum Files:&nbsp;
                              <input type="text" value={displayMode.maximumFiles.value} onChange={(ev)=>this.props.action('CHANGE_DISPLAY_MODE', {type:'maxFiles', value:ev.target.value})} placeholder="128"/>
                              <input type="radio" checked={displayMode.everything.set} onChange={()=>this.props.action('CHANGE_DISPLAY_MODE', {type:'everything'})}/>Everything*/}
                              <td><input type="checkbox" checked={this.props.state.filters.name.set} onChange={(e)=>{this.props.action('CHANGE_FILTER', {
                                    type: 'name',
                                    set: !this.props.state.filters.name.set,
                                    value: this.props.state.filters.name.value
                              })}} ref="chkbox"/>File Name</td>
                              <td><input type="text" value={this.props.state.filters.name.value} onChange={(e)=>{this.props.action('CHANGE_FILTER', {
                                    type: 'name',
                                    set: this.props.state.filters.name.set,
                                    value: e.target.value
                              })}} placeholder="javascript regex or just a name" className="form-control filename"/></td>
                        </tr>
                        <tr>
                              <td><input type="checkbox" checked={this.props.state.filters.owner.set} onChange={(e)=>{this.props.action('CHANGE_FILTER', {
                                    type: 'owner',
                                    set: !this.props.state.filters.owner.set,
                                    value: this.props.state.filters.owner.value
                              })}} ref="chkbox"/>Owner</td>
                              <td><input type="text" value={this.props.state.filters.owner.value} onChange={(e)=>{this.props.action('CHANGE_FILTER', {
                                    type: 'owner',
                                    set: this.props.state.filters.owner.set,
                                    value: e.target.value
                              })}} placeholder="javascript regex or just a name" className="form-control filename"/></td>
                        </tr>
                        <tr>
                              <td><input type="checkbox" checked={this.props.state.filters.size.set} onChange={(e)=>{this.props.action('CHANGE_FILTER', {
                                    type: 'size',
                                    set: !this.props.state.filters.size.set,
                                    value: this.props.state.filters.size.value
                              })}}/>File Size</td>
                              <td> <input type="number" placeholder="file size (MB)" min="0" step="100" value={this.props.state.filters.size.value} onChange={(e)=>{this.props.action('CHANGE_FILTER', {
                                    type: 'size',
                                    set: this.props.state.filters.size.set,
                                    value: parseInt(e.target.value)
                              })}} className="form-control filename"/></td>
                              <td> MB </td>
                        </tr>
                        <tr>
                              <td><input type="checkbox" disabled="true" checked={this.props.state.filters.created.set} onChange={()=>{this.state.action("CHANGE_FILTER", {
                                    type: "created",
                                    set: !this.props.state.filters.created.set,
                                    value: this.props.state.filters.created.value
                              })}}/>Created</td>
                              <td className='filter-calendar' ref='opt4'> 
                                    <Calendar format='DD/MM/YYYY' date={this.formatDate(this.props.state.filters.created.value)} onChange={(e)=>{
                                          let dateBlock = e.split('-');
                                          let newDate = new Date(dateBlock.pop(), dateBlock.shift()-1, dateBlock[0]);
                                          this.props.action("CHANGE_FILTER", {
                                                type: "created",
                                                set: this.props.state.filters.created.set,
                                                value: newDate
                                          })
                                          {/*console.log(e, newDate);*/}
                                    }}/>
                              </td>
                        </tr>
                        <tr>
                              <td><input type="checkbox" checked={this.props.state.filters.modified.set} onChange={()=>{this.props.action("CHANGE_FILTER", {
                                    type: "modified",
                                    set: !this.props.state.filters.modified.set,
                                    value: this.props.state.filters.modified.value
                              })}} />Modified</td>
                              <td className='filter-calendar' ref='opt4'> 
                                    <Calendar format='DD/MM/YYYY' date={this.formatDate(this.props.state.filters.modified.value)} onChange={(e)=>{
                                          let dateBlock = e.split('-');
                                          let newDate = new Date(dateBlock.pop(), dateBlock.shift()-1, dateBlock[0]);
                                          this.props.action("CHANGE_FILTER", {
                                                type: "modified",
                                                set: this.props.state.filters.modified.set,
                                                value: newDate
                                          })
                                          {/*console.log(e, newDate);*/}
                                    }}/>
                              </td>
                        </tr>
                  </tbody>
                 </table>      
            </div>
       )
 }
}
export default FilterOpt;