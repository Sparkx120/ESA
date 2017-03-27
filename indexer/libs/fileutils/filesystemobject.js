/** @module libs/fileutils/filesystemobject */

import fs from "fs";
import os from "os";
import path from "path"

/** Representation of a file system object. */
export default class FileSystemObject {

    /**
     * Creates an instance of FileSystemObject.
     *
     * @author Jonathan Tan
     * @param {boolean} isDirectory - Whether the object is a directory.
     * @param {boolean} isSymLink - Whether the object is a symbolic link.
     * @param {string} name - The file name of the object.
     * @param {number} size - The file size of the object.
     * @param {number} owner - The owner ID of the object.
     * @param {number} group - The group ID of the object.
     * @param {Date} lastModified - The date the object was last modified.
     * @param {string} hostname - The hostname of where the object is located.
     */
    constructor(isDirectory, isSymLink, name, size, owner, group, lastModified, hostname) {
        this._isDirectory = isDirectory;
        this._isSymLink = isSymLink;
        this._name = name;
        this._size = size;
        this._owner = owner;
        this._group = group;
        this._lastModified = lastModified;
        this._hostname = hostname;
        this._files = [];
        this._folders = [];
    }

    /**
     * A newly created {@link FileSystemObject}.
     *
     * @author Jonathan Tan
     * @typedef {Object} NewFileSystemObject
     * @property {FileSystemObject} fso - The representation of the object.
     * @property {number} unknown - The number of children files and directories unable to be read.
     */

    /**
     * Returns a representation of a a file system object given its path.
     *
     * @author Jonathan Tan
     * @param {string} filename - The file name of the object.
     * @returns {NewFileSystemObject} The representation of the object.
     */

    /**
     * Returns a representation of a a file system object given its path.
     *
     * @author Jonathan Tan
     * @static
     * @param {string} filename - The file name of the object.
     * @returns {NewFileSystemObject} The representation of the object.
     */
    static createFileSystemObject(filename) {
        // children files and directories that were unable to be read
        let unknown = 0;

        try {
            // normalize file path
            filename = path.normalize(filename);

            // get information about the file
            let stats = fs.lstatSync(filename);

            if (stats.isDirectory()) {
                // return representation for a directory
                let fso = new FileSystemObject(true, false, filename, stats["size"], stats["uid"], stats["gid"], stats["mtime"].getTime(), os.hostname());

                try {
                    // get the files contained with the directory
                    let contained = fs.readdirSync(filename);

                    // separate contained files into by whether they are a directory or not
                    for (let f of contained) {
                        try {
                            let fFullpath = path.join(filename, f);
                            let fStats = fs.lstatSync(fFullpath);

                            // add the files to the correct list
                            if (fStats.isDirectory() || fStats.isSymbolicLink()) {
                                fso.addFolder(fFullpath);
                            } else {
                                fso.addFile(fFullpath);
                            }
                        } catch (err) {
                            unknown++;
                            console.log(err.message);
                        }
                    }
                } catch (err) {
                    unknown++;
                    console.log(err.message);
                }

                return { fso, unknown };
            } else if (stats.isSymbolicLink()) {
                // return representation for a symbolic link
                return { fso: new FileSystemObject(true, true, filename, stats["size"], stats["uid"], stats["gid"], stats["mtime"].getTime(), os.hostname()), unknown };
            } else {
                // return representation for a file
                return { fso: new FileSystemObject(false, false, filename, stats["size"], stats["uid"], stats["gid"], stats["mtime"].getTime(), os.hostname()), unknown };
            }
        } catch (err) {
            unknown++;
            console.log(err.message);
            return { fso: null, unknown };
        }
    }

    /**
     * An object representation of a {@link FileSystemObject}.
     *
     * @typedef {Object} FileSystemObjectAsObject
     * @property {string} _id - The file name of the object.
     * @property {boolean} isDirectory - Whether the object is a directory.
     * @property {boolean} isSymLink - Whether the object is a symbolic link.
     * @property {number} size - The file size of the object.
     * @property {number} owner - The owner ID of the object.
     * @property {number} group - The group ID of the object.
     * @property {Date} last-modified - The date the object was last modified.
     * @property {string} hostname - The hostname of where the object is located.
     * @property {string[]} files - The object's children files' names.
     * @property {string[]} folders - The object's children directories's paths.
     */

    /**
     * Returns the file system object as a convenient JavaScript object.
     *
     * @author Jonathan Tan
     * @returns {FileSystemObjectAsObject} The JS object representation of the {@link FileSystemObject}.
     */
    toObject() {
        return {
            "_id": this._name,
            "isFolder": this._isDirectory,
            "isSymLink": this._isSymLink,
            "size": this._size,
            "owner": this._owner,
            "group": this._group,
            "last-modified": this._lastModified,
            "hostname": this._hostname,
            "files": this.files,
            "folders": this.folders
        };
    }

    /**
     * Adds a file name to the object's files array.
     *
     * @author Jonathan Tan
     * @param {string} filename - The file name to add.
     */
    addFile(filename) {
        this._files.push(filename);
    }

    /**
     * Adds a folder path to the object's folders array.
     *
     * @author Jonathan Tan
     * @param {string} dirpath - The directory path to add.
     */
    addFolder(dirpath) {
        this._folders.push(dirpath);
    }

    /* setters and getters */
    set isDirectory(isDirectory)    { this._isDirectory = isDirectory; }
    get isDirectory()               { return this._isDirectory; }
    set isSymLink(isSymLink)        { this._isSymLink = isSymLink; }
    get isSymLink()                 { return this._isSymLink; }
    set name(name)                  { this._name = name; }
    get name()                      { return this._name; }
    set size(size)                  { this._size = size; }
    get size()                      { return this._size; }
    set owner(owner)                { this._owner = owner; }
    get owner()                     { return this._owner; }
    set group(group)                { this._group = group; }
    get group()                     { return this._group; }
    set lastModified(lastModified)  { this._lastModified = lastModified; }
    get lastModified()              { return this._lastModified; }
    set hostname(hostname)          { this._hostname = hostname; }
    get hostname()                  { return this._hostname; }
    get files()                     { return (this._isDirectory ? this._files : null); }
    get folders()                   { return (this._isDirectory ? this._folders : null); }
}
