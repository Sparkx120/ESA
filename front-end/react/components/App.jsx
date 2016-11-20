import React from 'react';

/**
 * Root Application Container
 * @author James Wake
 * @class App
 */
export default class App extends React.Component {
    render() {
        return(
            <div className="App">
                {this.props.children}
            </div>
        );
	}
};
