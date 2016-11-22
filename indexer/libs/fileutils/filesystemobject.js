// filesystem modules
import fs from "fs";
import os from "os";

// logging module
import logger from "../logging/logger";

export class FileSystemObject {
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

    /* Returns a FileSystemObject representation of a file given its path. */
    static createFileSystemObject(filename) {
        let unknown = 0;

        try {
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
                            let fFullpath = `${filename}/${f}`;
                            let fStats = fs.lstatSync(fFullpath);

                            // add the files to the correct list
                            if (fStats.isDirectory() || fStats.isSymbolicLink()) {
                                fso.addFolder(fFullpath);
                            } else {
                                fso.addFile(fFullpath);
                            }
                        } catch (err) {
                            unknown++;
                            logger.error(err.toString());
                        }
                    }
                } catch (err) {
                    unknown++;
                    logger.error(err.toString());
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
            logger.error(err.toString());
            return { fso: null, unknown };
        }
    }

    /* Returns the file system object as a convenient JS object. */
    toObject() {
        return { "_id": this._name,
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

    /* Adds a file name to the object's files array. */
    addFile(filename) {
        this._files.push(filename);
    }

    /* Adds a folder path to the object's folders array. */
    addFolder(dirpath) {
        this._folders.push(dirpath);
    }
}
