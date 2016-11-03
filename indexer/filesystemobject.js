// filesystem modules
const fs = require("fs");
const os = require("os");

export class FileSystemObject {
    constructor(isDirectory, name, parent, fullpath, size, owner, group, lastModified, hostname) {
        this.isDirectory = isDirectory;
        this.name = name;
        this.parent = parent;
        this.fullpath = fullpath;
        this.size = size;
        this.owner = owner;
        this.group = group;
        this.lastModified = lastModified;
        this.hostname = hostname;
    }

    static createFileSystemObject(parent, filename) {
        var fullpath = parent == null ? filename : parent + "/" + filename;
        var stats = fs.statSync(fullpath);
        return new FileSystemObject(stats.isDirectory(), filename, parent, fullpath, stats["size"], stats["uid"], stats["gid"], stats["mtime"].getTime(), os.hostname());
    }
}
