/**
 * Handles the boolean filter results for a single element of your data
 * @param {Object} filters 
 * @param {Object} data 
 */
export function handleFilters(filters, data){
	//Handle Name Filter
	if(filters.name.set){
		let name = data.path || data.name;
		try{
			let regex = new RegExp(filters.name.value);
			if(regex.exec(name) == null){
				return false;
			}
		} catch (e) {
			return false
		}
		
	}

	//Handle Owner Filter
	if(filters.owner.set){
		let name = data.owner;
		try{
			let regex = new RegExp(filters.owner.value);
			if(regex.exec(name) == null){
				return false;
			}
		} catch (e) {
			return false
		}
		
	}

	//Handle Size Filter
	if(filters.size.set){
		let size = data.size;
		if(data.folderSize != undefined){
			size = data.folderSize;
		}
		if(size < filters.size.value*1000000){
			return false;
		}
	}

	//Handle Modified Filter
	if(filters.created.set){
		let dateFile = new Date(data.created); //Not data yet...
		if(filters.created.value < dateFile){
			return false;
		}
	}

	//Handle Modified Filter
	if(filters.modified.set){
		let dateFile = new Date(data.lastModified);
		if(filters.modified.value < dateFile){
			return false;
		}
	}

	return true
}

/**
 * Returns whether a filters set has any enabled filters
 * @param {Object} filters 
 */
export function isFiltering(filters){
	for(let k in filters){
		if(filters[k].set){
			return true;
		}
	}
	return false;
}