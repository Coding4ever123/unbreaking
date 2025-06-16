/* Your code goes here, to run press F5. 
It will automaticaly compile*/

import * as bodyParser from "body-parser";
import * as path from "node:path";
import * as express from "express";

import config from "./config";
import saver from "./saver";
import Database from "./database";

const app = express.default();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const db = new Database();

function combineWithRoot(path) {
    const root = ((config.root as string) ?? "").replace(/.+/gm, "/$&/");

    let a = `/${root}/${path}`;
    return a.replace(/\/{2,}/gm, "/");
}

app.post(combineWithRoot("/" + config.postURL), (req, res) => {
    saver(req, db, (err, filename) => {
        if (err || !filename) {
            res.status(500).send("Error saving report: " + err.message);
            return;
        }

        console.log("saved", filename);
        res.send(path.basename(filename));
        res.end();
    });
});
app.get(combineWithRoot(`/api/getAllRecords/:page`), (req, res) => {
    let value = parseInt(req.params.page);
    if (Number.isNaN(value)) {
        res.json({ error: "Invalid Argument: Page" });
        return;
    }

    db.getAllRecords(value, (x) => res.json(x));
});

app.get(combineWithRoot(`/api/getAmountPages`), (req, res) => {
    db.getAmountPages((x) => res.json(x));
});
app.get(combineWithRoot(`/api/getRecord/:id`), (req, res) => {
    db.restoreRecord(req.params.id, (err, result) => {
        if (err) {
            res.send(err);
            return;
        }
        result.fields = JSON.parse(result.fields);
        res.json(result);
    });
});

app.use(
    combineWithRoot("/"),
    express.static(path.resolve(__dirname, "..", "web", "out"))
);

app.use(combineWithRoot("/"), (req, res, next) => {
    res.status(404).send("404 Not Found");
});

const port = config.port;
app.listen(port);
console.log(
    `Listening on port ${port} (http://127.0.0.1:${port}${combineWithRoot("/")})`
);
