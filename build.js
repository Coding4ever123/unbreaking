const path = require("path");
const esbuild = require("esbuild");
(async () => {
    const esbuildPluginTsc = require("esbuild-plugin-tsc");

    esbuild.build({
        entryPoints: [path.resolve(__dirname, "./src/main.ts")],
        outfile: path.resolve(__dirname, "out/main.js"),
        bundle: true,
        platform: "node",
        plugins: [
            esbuildPluginTsc({
                force: true,
            }),
        ],
        minify: true,
    });
})();

(async () => {
    esbuild.build({
        entryPoints: [path.resolve(__dirname, "./web/src/index.ts")],
        outfile: path.resolve(__dirname, "./web/out/index.js"),
        bundle: true,
        plugins: [],
        minify: true,
    });
})();

(async () => {
    esbuild.build({
        entryPoints: [path.resolve(__dirname, "./web/src/index.css")],
        outfile: path.resolve(__dirname, "./web/out/index.css"),
        bundle: true,
        plugins: [],

        minify: true,
        loader: {
            ".ttf": "file",
            ".woff2": "file",
        },
    });
})();
(async () => {
    const fs = require("fs");
    const srcdir = path.resolve(__dirname, "./web/src");
    const outdir = path.resolve(__dirname, "./web/out");
    function copyOver(name) {
        fs.copyFileSync(path.resolve(srcdir, name), path.resolve(outdir, name));
    }
    function mkdir(name) {
        let p = path.resolve(outdir, name);
        if (fs.existsSync(p) && fs.statSync(p).isDirectory()) return;
        fs.mkdirSync(p);
    }
    mkdir("assets");
    copyOver("index.html");
    copyOver("assets/favicon.png");
})();
