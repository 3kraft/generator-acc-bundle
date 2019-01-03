const fs = require("fs");
const path = require("path");
const tar = require("tar");

var files = fs.readdirSync("src");
console.log(process.argv[2]);
tar.c(
  {
    gzip: true,
    file: process.argv[2],
    filter: function(entryPath, stat) {
      return !path.basename(entryPath).startsWith(".");
    },
    cwd: "src"
  },
  files
)
