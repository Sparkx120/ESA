import {find, getCollections, waitForConn, dropCollection} from './data/mongo.js';

(function run(){
	console.log("Running Database Management Console for ESA");
	waitForConn().then(()=>{
		return getCollections();
	}).then((collections)=>{
		console.log("\nCollections in Database:\n");

		for(let i=0;i<collections.length;i++){
			console.log(`${i}: ${collections[i].name}\n`);
		}

		console.log("Which one would you like to remove (#): ");
		let stdin = process.openStdin();
		stdin.addListener("data", (d)=>{
			let selection = new String(d);
			selection = selection.trim();
			//d = d.trim();
			// console.log(typeof d);
			if(selection == 'a' || selection == 'A'){
				console.log(`Removing ALL collections!!!`);
			}
			else{
				console.log(`Removing ${selection} from collections\n`);
				dropCollection(collections[parseInt(selection)].name).then(()=>{
					"Collection Dropped"
				});
			}
		});
	}).catch((e)=>{console.log(`Error! ${e}`);});
	
})();

// run();
