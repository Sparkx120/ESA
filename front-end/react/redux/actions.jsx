/**
 * Redux Actions
 * @author James Wake
 */

export const receiveTree = (data) => {
	return {
		type: 'RECEIVE_TREE',
		data
	}
}

export const getTree = (container, root) => {
	return {
		type: 'GET_TREE',
		container,
		root
	}
}

export const getContainers = () => {
	return {
		type: 'GET_CONTAINERS'
	}
}