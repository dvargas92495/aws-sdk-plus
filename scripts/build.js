const esbuild = require("esbuild");
const fs = require("fs");
const entryPoints = fs
  .readdirSync("src", { withFileTypes: true })
  .filter((f) => !f.isDirectory())
  .map((f) => `./src/${f.name}`);

esbuild
  .build({
    entryPoints,
    external: ["aws-sdk"],
    outdir: "dist",
    bundle: true,
  })
  .then(() => console.log("done!"));
