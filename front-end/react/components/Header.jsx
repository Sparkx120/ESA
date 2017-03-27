import React from 'react';
import scss from '../styles/header.scss'; 
import { Link } from 'react-router';

import Menu from './menu/Menu.js';
import MenuOption from './menu/MenuOption.js';
import MenuOptions from './menu/MenuOptions.js';
import MenuTrigger from './menu/MenuTrigger.js';
//fontawesome icons
import FaUser from 'react-icons/lib/fa/user';
import FaFile from 'react-icons/lib/fa/file';
import FaCog from 'react-icons/lib/fa/cog';
import FaSignOut from 'react-icons/lib/fa/sign-out';
// import scss from '../styles/font-awesome-4.7.0/scss/font-awesome.scss';
/**
 * Root Application Container
 * @author James Wake
 * @class App
 */
class Header extends React.Component {
    render() {
        return(
            <nav className="navbar navbar-default navbar-static-top" role="navigation">
            <div className="navbar-left">
                 <Link className="navbar-brand" to="/">4J Enterprise Storage Analysis System</Link>
            </div>
            <ul className="navbar-right">
                                
                  {/*<Menu className="usericon">
                     <MenuTrigger className='dropdown'>
                        <Link className="username">User</Link>
                        <FaUser/>
                     </MenuTrigger>
                        <MenuOptions>
                            <MenuOption><FaFile/> profile</MenuOption>
                            <MenuOption><FaCog/> setting</MenuOption>
                            <MenuOption><FaSignOut/> sign out</MenuOption>
                        </MenuOptions>
                  </Menu>*/}
            </ul>
            </nav>
        );
	}
};
export default Header;

