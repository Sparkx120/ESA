let resizeBlock = {
    "default": ()=>{/*do Nothing*/}
};

let keyBlock = {
    "default": ()=>{/*do Nothing*/}
}

window.addEventListener("keyup", (e)=>{
    for(let key in keyBlock){
        keyBlock[key](e);
    }
});

window.addEventListener("resize", ()=>{
    for(let key in resizeBlock){
        resizeBlock[key]();
    }
});

export function setResizeCallback(key ,value){
    resizeBlock[key] = value;
}

export function deleteResizeCallback(key){
    delete resizeBlock[key];
}

export function setKeyCallback(key, value){
    keyBlock[key] = value;
}

export function deleteKeyCallback(key){
    delete keyBlock[key];
}