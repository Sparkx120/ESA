import React from 'react';
import Header from './Header.jsx';
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
               {this.props.children}
             {/* default page from RouteIndex in index.jsx;
                 Welcome.jsx in this case*/}
            </div>
        );
	}
};