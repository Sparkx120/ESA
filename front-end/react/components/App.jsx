import React from 'react';
// import Home from './Pages/Home.jsx';
import Header from './Header.jsx';
// import SplitPane from './splitpane/SplitPane.js';


import Accordion from './Accordion.jsx';
import scss from '../styles/style.scss'; 
/**
 * Root Application Container 
 * @author James Wake
 * @class App
 */
export default class App extends React.Component {
    componentDidMount(){
    }

    render() {
        return(
            <div id="wrapper" className='root'>
                <Header/>
                <Accordion/>  
                  
             {/*  {this.props.children}    */}
             {/* default page from RouteIndex in index.jsx;
                 Welcome.jsx in this case*/}
            </div>
        );
	}
};