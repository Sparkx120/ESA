/**
 * The Root of the React Application
 * @author James Wake
 * @version 0.1.0
 */
import React  from 'react';
import { render } from 'react-dom';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
// import scss from './styles/style.scss'; //Import Styles Here

//Static Routing for React App
import App from './components/App.jsx';	
import Home from './components/Pages/Home.jsx';
// import Accordion from './components/Accordion.jsx';
import Root from './components/Root.jsx';
import LandingPage from './components/LandingPage.jsx';

//Redux Stuff
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { application } from './redux/reducer.jsx'

let store = createStore(application);

ReactDOM.render((
	<Provider store={store}>
		<Router history={browserHistory}>
			<Route path="/" component={App}>
				<IndexRoute component={Root}/>
				{/*<Route path='/fs' component={Accordion2}/>*/}
				<Route path='/landing' component={LandingPage}/>
				<Route path="/test" component={Home}/>
			</Route>
		</Router>
	</Provider>
), document.getElementById('react'));
