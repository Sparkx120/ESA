/** @module libs/parallel/minheap */

/** Hashed min-heap implementation to organize worker processes. */
export default class MinHeap {

    /**
     * A key-value pair in the heap.
     * 
     * @author Jonathan Tan
     * @typedef {Object} KeyValuePair
     * @property {*} key - The key by which to identify values.
     * @property {*} value - The value associated with the key.
     */

    /**
     * Creates an instance of MinHeap.
     * 
     * @author Jonathan Tan
     */
    constructor() {
        this._heap = [];
        this._hash = new Map();
    }

    /**
     * Swaps the nodes at the given indices.
     * 
     * @author Jonathan Tan
     * @param {number} a - The index of the first node.
     * @param {number} b - The index of the second node.
     */
    _swap(a, b) {
        let temp = this._heap[a];
        this._heap[a] = this._heap[b];
        this._heap[b] = temp;

        this._hash.set(this._heap[a]["key"], a);
        this._hash.set(this._heap[b]["key"], b);
    }

    /**
     * Enforces the heap property for all ancestor nodes to the the node given by the index.
     * 
     * @author Jonathan Tan
     * @param {number} rootIndex - The index of the node where to start the up-heap process.
     */
    _upheap(rootIndex) {
        let parentIndex;

        while (rootIndex != 0) {
            // get the index of the parent node
            parentIndex = (rootIndex - 1) >> 1;

            if (this._heap[parentIndex]["value"] > this._heap[rootIndex]["value"]) {
                // swap
                this._swap(rootIndex, parentIndex);
            } else {
                break;
            }

            // move up to the parent node
            rootIndex = parentIndex;
        }
    }

    /**
     * Enforces the heap property for the subtree rooted at the node given by the index.
     * 
     * @author Jonathan Tan
     * @param {number} rootIndex - The index of the node where to start the down-heap process.
     */
    _downheap(rootIndex) {
        let left;
        let right;
        let smaller;

        while (rootIndex < this._heap.length) {
            // get the indices of the left and right children
            left = (rootIndex << 1) + 1;
            right = (rootIndex << 1) + 2;

            // determine the smaller of both children to swap with
            if (left >= this._heap.length) {
                // reached leaf node, return
                return;
            } else if (left == this._heap.length - 1) {
                // no right child so check with left one
                smaller = left;
            } else {
                // determine which child is smaller
                if (this._heap[left]["value"] <= this._heap[right]["value"]) {
                    smaller = left;
                } else {
                    smaller = right;
                }
            }

            if (this._heap[rootIndex]["value"] > this._heap[smaller]["value"]) {
                // swap
                this._swap(rootIndex, smaller);
            } else {
                // no swap, so return
                return;
            }

            // move down to the child node
            rootIndex = smaller;
        }
    }

    /**
     * Returns the size of the heap.
     * 
     * @author Jonathan Tan
     * @returns {number} The number of nodes in the heap.
     */
    size() {
        return this._heap.length;
    }

    /**
     * Returns, but does not remove, the minimum element in the heap.
     * 
     * @author Jonathan Tan
     * @returns {KeyValuePair} The minimum element in the heap.
     */
    peek() {
        return this._heap[0];
    }

    /**
     * Constructs and adds a new key-value pair into the heap.
     * 
     * @author Jonathan Tan
     * @param {*} key - The key by which to identify values.
     * @param {*} value - The value associated with the key.
     */
    insert(key, value) {
        // add element to next spot in heap
        this._heap.push({ key, value });
        this._hash.set(key, this._heap.length - 1);

        // ensure that the heap property is satisfied for the entire heap
        this._upheap(this._heap.length - 1);
    }

    /**
     * Removes and returns the minimum element in the heap.
     * 
     * @author Jonathan Tan
     * @returns {KeyValuePair} The minimum element in the heap, undefined if heap is empty.
     */
    extract() {
        if (this._heap.length == 0) {
            // return undefined for empty heap
            return;
        } else if (this._heap.length == 1) {
            // remove and return the root
            this._hash.delete(this._heap[0]["key"]);
            return this._heap.pop();
        } else {
            // record the root of the heap
            let min = this._heap[0];
            this._hash.delete(min["key"]);

            // replace root with last element in heap
            this._heap[0] = this._heap.pop();

            // ensure that the heap property is satisfied for the entire heap
            this._downheap(0);

            return min;
        }
    }

    /**
     * Returns the value associated with the key in the map.
     * 
     * @author Jonathan Tan
     * @param {*} key - The key to look for.
     * @returns The value associated with the key, undefined if key is not in the heap.
     */
    valueOfKey(key) {
        // get the index of the node in the heap
        let index = this._hash.get(key);

        if (index !== undefined) {
            return this._heap[index]["value"];
        }
    }

    /**
     * Updates the value associated with the key in heap.
     * 
     * @author Jonathan Tan
     * @param {*} key - The key of the element to update.
     * @param {*} newValue - The new value to associate with the key.
     */
    update(key, newValue) {
        // get the index of the node in the heap
        let index = this._hash.get(key);

        if (index !== undefined) {
            // record the old value of the node
            let oldValue = this._heap[index]["value"];

            // update the element with the new value
            this._heap[index] = { key, value: newValue };

            // ensure that the heap property is enforced
            if (oldValue < newValue) {
                this._downheap(index);
            } else {
                this._upheap(index);
            }
        }
    }
}
