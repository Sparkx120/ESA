let resizeBlock = {
    "default": ()=>{/*do Nothing*/}
};

window.addEventListener("resize", ()=>{
    for(let key in resizeBlock){
        console.log("Window Resize Function: " + key)
        resizeBlock[key]();
    }
});

export function setResizeCallback(key ,value){
    resizeBlock[key] = value;
}

export function deleteResizeCallback(key){
    delete resizeBlock[key];
}