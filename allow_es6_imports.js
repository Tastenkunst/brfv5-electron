const { protocol }     = require("electron");

const fs                = require("fs");
const { extname }       = require("path");
const { URL }           = require("url");

//https://gist.github.com/smotaal/f1e6dbb5c0420bfd585874bd29f11c43 -- look and use
//https://stackoverflow.com/questions/51113097/electron-es6-module-import/51126482

const checkImportRegex  = /import(\s*{?\*?[\s\w,$]*}?\s*(as)?[\s\w]*from\s|[\s]*)['\"]([^\.\/][\w\/\-@.]*?)['\"]/g;
const checkRelativeImportRegex = new RegExp("import(\\s*{?\\*?[\\s\\w,$]*}?\\s*(as)?[\\s\\w]*from\\s|[\\s]*)['\\\"]([\\.\\/][\\w\\/\\-@.]*?)['\\\"]", 'g');

const createProtocol = (scheme, normalize = true) => {

  console.warn('createProtocol:', scheme)

  protocol.registerBufferProtocol(scheme,
    async (request, respond) => {

      console.warn('registerBufferProtocol: url:', request.url)

      let pathName = new URL(request.url).pathname;
      pathName = decodeURI(pathName); // Needed in case URL contains spaces

      try {
        let file = __dirname + "/" + pathName;
        if (fs.existsSync(file)) {
          let data = await fs.promises.readFile(file);
          let extension = extname(file).toLowerCase();
          let mimeType = "";

          if (extension === ".js") {
            let dir = pathName.substring(0, pathName.lastIndexOf("/") + 1);
            data = Buffer.from(await parseImports(file, data, dir));
            mimeType = "text/javascript";
          }
          else if (extension === ".html")
            mimeType = "text/html";
          else if (extension === ".css")
            mimeType = "text/css";
          else if (extension === ".svg" || extension === ".svgz")
            mimeType = "image/svg+xml";
          else if (extension === ".json")
            mimeType = "application/json";


          respond({ mimeType, data });
        } else {
          console.error(`File does not exist ${pathName}`);
          throw `File does not exist ${pathName}`;
        }
      } catch (err) {
        console.error(`Error loading file ${pathName}`, err);
        throw `Error loading file ${pathName}`;
      }
    },
    (error) => {
      if (error) {
        console.error(`Failed to register ${scheme} protocol`, error);
      }
    }
  );
}

async function parseImports(file, data, dir) {

  data = data.toString();
  let matches = [];
  let mtc = checkRelativeImportRegex.exec(data);
  while (mtc) {
    matches.push(mtc);
    mtc = checkRelativeImportRegex.exec(data);
  }
  let lastpos = 0;
  let newData = "";
  for (let m of matches) {
    let newImportName = await buildImportName(m[3], dir);
    if (newImportName != m[3]) {
      newData += data.substr(lastpos, m.index - lastpos);
      newData += "import" + m[1] + "'" + newImportName + "'";
      lastpos = m.index + m[0].length;
    }
  }
  newData += data.substr(lastpos, data.length - lastpos);
  matches = [];
  lastpos = 0;
  data = newData
  newData = "";
  mtc = checkImportRegex.exec(data);
  while (mtc) {
    matches.push(mtc);
    mtc = checkImportRegex.exec(data);
  }
  for (let m of matches) {
    let newImportName = await buildImportName(m[3]);
    if (newImportName != m[3]) {
      newData += data.substr(lastpos, m.index - lastpos);
      newData += "import" + m[1] + "'" + newImportName + "'";
      lastpos = m.index + m[0].length;
    }
  }
  newData += data.substr(lastpos, data.length - lastpos);
  return newData;
}

async function buildImportName(importName, dirName = "") {

  if (importName[0] == '.' || importName[0] == '/') {
    let file = await buildImportFileName(importName, dirName);
    if (file != null)
      return importName + file;
    return importName;
  }

  let resFile = await buildImportFileName("./" + importName);
  if (resFile != null)
    return "/" + importName + resFile;
  resFile = await buildImportFileName("./node_modules/" + importName);
  if (resFile != null)
    return "/node_modules/" + importName + resFile;
  return importName;
}

async function buildImportFileName(importName, dirName = "") {
  if (fs.existsSync(__dirname + '/' + dirName + '/' + importName) && !fs.lstatSync(__dirname + '/' + dirName + '/' + importName).isDirectory())
    return '';
  if (fs.existsSync(__dirname + '/' + dirName + '/' + importName + '.js'))
    return '.js';
  if (fs.existsSync(__dirname + '/' + dirName + '/' + importName + (importName[importName.length - 1] == '/' ? "" : "/") + 'index.js'))
    return importName[importName.length - 1] == '/' ? "index.js" : "/index.js";
  if (fs.existsSync(__dirname + '/' + dirName + '/' + importName + (importName[importName.length - 1] == '/' ? "" : "/") + 'package.json')) {
    let json = JSON.parse(await fs.promises.readFile(__dirname + '/' + dirName + '/' + importName + (importName[importName.length - 1] == '/' ? "" : "/") + 'package.json', 'utf8'));
    let main = json.main;
    if (fs.existsSync(__dirname + '/' + dirName + '/' + importName + (importName[importName.length - 1] == '/' ? "" : "/") + main) && !fs.lstatSync(__dirname + '/' + dirName + '/' + importName + (importName[importName.length - 1] == '/' ? "" : "/") + main).isDirectory())
      return importName[importName.length - 1] == '/' ? main : "/" + main;
    if (fs.existsSync(__dirname + '/' + dirName + '/' + importName + (importName[importName.length - 1] == '/' ? "" : "/") + main + '.js'))
      return importName[importName.length - 1] == '/' ? main + ".js" : "/" + main + ".js";
    if (fs.existsSync(__dirname + '/' + dirName + '/' + importName + (importName[importName.length - 1] == '/' ? "" : "/") + main + 'index.js'))
      return importName[importName.length - 1] == '/' ? main + "/index.js" : "/" + main + "/index.js";
  }

  return null;
}

module.exports = { createProtocol }
