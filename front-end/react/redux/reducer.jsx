/**
 * Redux Reducer for this application (We could split it up later)
 * @author James Wake
 */
import { combineReducers } from 'redux';
import { socket } from '../socket.js';
let applicationInitialState = {
	dataStack: [],
	newData: null,
	graphConfig: {
		display: {mode: "DIRECTORY_ONLY", value: null},
		color: {mode:"DEPTH", value: null}
	},
	filters: {
		fileName: null,
		fileSize: null,
	}
}

// export const database = (state = )

export const socketTree = (state = applicationInitialState, action) => {
	switch(action.type){
		case 'RECEIVE_TREE':
			let dataStack = state.dataStack;
			dataStack.push(action.data);
			newState = Object.assign({}, state, {dataStack: dataStack})
			return newState;

		case 'GET_TREE':
			// socket.
			return state;
		default:
			return state;
	}
};

export const application = combineReducers({
	socketTree
});