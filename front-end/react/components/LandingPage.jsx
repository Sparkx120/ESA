import React from 'react';
import { Link } from 'react-router';
/**
 * Landing Page
 * @author James Wake
 * @class LandingPage
 */
export default class LandingPage extends React.Component {
    render() {
        return(
            <div>
                 <h1 id='welcome'>Welcome to 4J!!!<br/>
                 <Link to="/fs">Get Started</Link>
                 </h1>
            </div>
        );
	}
};
