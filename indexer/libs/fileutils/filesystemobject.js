// filesystem modules
import * as fs from "fs";
import * as os from "os";

// logging module
import {logger} from "../logging/logger";

export class FileSystemObject {
    constructor(isDirectory, name, parent, fullpath, size, owner, group, lastModified, hostname) {
        this._isDirectory = isDirectory;
        this._name = name;
        this._parent = parent;
        this._fullpath = fullpath;
        this._size = size;
        this._owner = owner;
        this._group = group;
        this._lastModified = lastModified;
        this._hostname = hostname;
    }

    /* Returns a FileSystemObject representation of a file given its path. */
    static createFileSystemObject(parent, filename) {
        let fullpath = parent == null ? filename : `${parent}/${filename}`;
        let stats = fs.statSync(fullpath);
        return new FileSystemObject(stats.isDirectory(), filename, parent, fullpath, stats["size"], stats["uid"], stats["gid"], stats["mtime"].getTime(), os.hostname());
    }

    /* Given a pathname, separate the file system objects contained in it into files and directories. */
    static splitIntoFilesAndDirectories(pathname) {
        let files = [];
        let directories = [];
        let numErrors = 0;

        try {
            // get the files contained with the directory
            let contained = fs.readdirSync(pathname);

            for (let f of contained) {
                try {
                    // create a file system object containing the details of the file
                    let fso = FileSystemObject.createFileSystemObject(pathname, f);

                    // separate file system objects into lists by whether they are a directory or not
                    if (fso.isDirectory) {
                        directories.push(fso);
                    } else {
                        files.push(fso);
                    }
                } catch (err) {
                    logger.error(err.toString());
                    numErrors++;
                }
            }
        } catch (err) {
            logger.error(err.toString());
            numErrors++;
        }

        return { files, directories, errorCount: numErrors };
    }

    /* setters and getters */
    set isDirectory(isDirectory)    { this._isDirectory = isDirectory; }
    get isDirectory()               { return this._isDirectory; }
    set name(name)                  { this._name = name; }
    get name()                      { return this._name; }
    set parent(parent)              { this._parent = parent; }
    get parent()                    { return this._parent; }
    set fullpath(fullpath)          { this._fullpath = fullpath; }
    get fullpath()                  { return this._fullpath; }
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
}
