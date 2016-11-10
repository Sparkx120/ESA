/* Returns whether or not an array is empty. */
function isEmpty(arr) {
    return typeof arr == "undefined" || arr == null || arr.length == 0;
}

export { isEmpty };
