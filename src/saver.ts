import type * as express from "express";

import * as fs from "fs-plus";
import * as path from "node:path";
import { mkdirp } from "mkdirp";

import config from "./config";
import Database from "./database";
import Record from "./record";

export default function (
    req: express.Request,
    db: Database,
    callback: (err: Error, filename?: string) => void
) {
    return Record.createFromRequest(req, function (err, record) {
        if (err != null) {
            return callback(new Error("Invalid breakpad request"));
        }
        let dist = config.savePath.minidump;
        mkdirp(dist);
        let filename = path.join(dist, record.id);
        return fs.copy(record.path, filename, function (err) {
            if (err != null) {
                return callback(new Error(`Cannot create file: ${filename}`));
            }
            record.path = filename;
            return db.saveRecord(record, function (err) {
                if (err != null) {
                    return callback(
                        new Error("Cannot save record to database")
                    );
                }
                return callback(null, filename);
            });
        });
    });
}
