import * as path from "node:path";
import { mkdirpSync as mkdirp } from "mkdirp";
import { EventEmitter } from "node:events";
import * as sqlite from "node:sqlite";

import config from "./config";
import Record1 from "./record";
import * as queries from "./queries";

class Database extends EventEmitter {
    db: sqlite.DatabaseSync;

    // Public: Create or open a Database with path to {filename}
    constructor(filename = config.savePath.db) {
        super();
        let dist = path.resolve(filename, "..");
        mkdirp(dist);
        this.db = new sqlite.DatabaseSync(filename);
        this.emit("load");
        this.db.exec(queries.init);
    }

    // Public: Saves a record to database.
    saveRecord(record: Record1, callback: (err: Error | null) => void) {
        if (record) {
            let statement = this.db.prepare(queries.write);
            statement.run({
                $time: record.time.getTime(),
                $uuid: record.id,
                $path: record.path,
                $ua: record.sender.ua,
                $ip: record.sender.ip,
                $fields: JSON.stringify(record.fields),
            });
        }
        callback(null);
    }

    // Public: Restore a record from database according to its id.
    restoreRecord(
        id: string,
        callback: (err: Error | null, record?: any) => void
    ) {
        let statement = this.db.prepare(queries.getSpecific);
        let raw = statement.get({
            $uuid: id,
        });

        if (!raw) return callback(new Error("Record is not in database"));
        callback(null, raw);
    }

    // Public: Returns all records as an array.
    getAllRecords(page: number, cb: (records: Record1[]) => void): void {
        const records = [];
        let offset = page * queries.ElementsPerPage;
        let statement = this.db.prepare(queries.getAll);
        let out = statement.all({ $offset: offset });
        for (const row of out) {
            row.fields = JSON.parse(row.fields.toString());
            records.push(row);
        }
        cb(records.reverse());
    }
    getAmountPages(cb: (value: number) => void) {
        let statement = this.db.prepare(queries.getAmountPages);
        let out = statement.get().output as number;
        out = Math.ceil(out / queries.ElementsPerPage);
        cb(out);
    }
}
export default Database;
