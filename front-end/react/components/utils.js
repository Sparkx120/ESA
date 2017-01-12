/**
 * Generate UUIDs
 * Code originally from: https://jsfiddle.net/briguy37/2MVFd/
 */
export function generateUUID(componentType) {
    var d = new Date().getTime();
    return `${componentType}-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
}    