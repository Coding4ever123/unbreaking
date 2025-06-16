import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";
let maindir = join(__dirname, "..");
let data = JSON.parse(readFileSync(resolve(maindir, "config.json"), "utf-8"));
data.savePath.db = resolve(
    maindir,
    data.savePath.db ?? "pool/database/sqlite3/db.db"
);
data.savePath.minidump = resolve(
    maindir,
    data.savePath.minidump ?? "pool/files/minidump"
);
data.port = data.port ?? 80;
data.root = data.root ?? "/";
data.postURL = data.postURL ?? "/post";
export default data;
