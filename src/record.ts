//import * as path from "path";
import type * as express from "express";
import * as uuid from "node:crypto";

import * as formidable from "./formidable/index.js";

class Record1 {
    id: string;
    time: Date;
    path: string;
    sender: {
        ua: string;
        ip: string;
    };
    product: string;
    version: string;
    fields: Record<string, any>;

    constructor({
        id: id1,
        time,
        path: path1,
        sender,
        product,
        version,
        fields: fields1,
    }) {
        this.id = id1;
        this.time = time;
        this.path = path1;
        this.sender = sender;
        this.product = product;
        this.version = version;
        this.fields = fields1;
        if (this.id == null) this.id = uuid.randomUUID();
        if (this.time == null) this.time = new Date();
    }

    // Public: Parse web request to get the record.
    static createFromRequest(
        req: express.Request,
        callback: (err: Error, record?: Record1) => any
    ) {
        let form = new formidable.IncomingForm();
        form.parse(req, function (error, fields, files) {
            if (error) return callback(error);

            let minidump_file = files.upload_file_minidump[0];
            if (minidump_file == null || minidump_file.filepath == null)
                return callback(new Error("Invalid breakpad upload"));

            let record = new Record1({
                time: null,
                id: null,
                path: minidump_file.filepath,
                sender: {
                    ua: req.headers["user-agent"],
                    ip: Record1.getIpAddress(req),
                },
                product: fields.prod,
                version: fields.ver,
                fields: fields,
            });
            return callback(null, record);
        });
    }

    // Public: Restore a Record from raw representation.
    static unserialize(
        id: string,
        representation: {
            time: number;
            path: string;
            sender: {
                ua: string;
                ip: string;
            };
            fields: Record<string, any>;
        }
    ) {
        return new Record1({
            id: id,
            time: new Date(representation.time),
            path: representation.path,
            sender: representation.sender,
            product: representation.fields.prod,
            version: representation.fields.ver,
            fields: representation.fields,
        });
    }

    // Private: Gets the IP address from request.
    static getIpAddress(req: express.Request) {
        return req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    }

    // Public: Returns the representation to be stored in database.
    serialize() {
        return {
            time: this.time.getTime(),
            path: this.path,
            sender: this.sender,
            fields: this.fields,
        };
    }
}

export default Record1;
