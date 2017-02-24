const url = require('url');
const path = require('path');
const fs = require('fs');

// Maps extensions to content-types
const extToType = {
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.html': 'text/html',
  '.css': 'text/css',
  '.json': 'application/json',
  '.js': 'application/javascript',
  '.xml': 'text/xml',
};

// Creates Promise to create a file.
const GetFile = fileName => new Promise((resolve, reject) => {
  const filePath = path.resolve(`${__dirname}/../client/`, `./${fileName}`);

  fs.readFile(filePath, (err, data) => {
    if (err) {  // If the file is not found, call reject function.
      reject(err);
    } else {    // If the file is found, call resolve function.
      resolve(data);
    }
  });
});

// Handle requests
const HandleFileRequest = (request, response) => {
  console.log(request.url);
  const urlObject = url.parse(request.url, true);
  const pathname = urlObject.pathname === '/' ? '/client.html' : urlObject.pathname;
  const fileExtension = path.extname(pathname);

  GetFile(pathname).then(
    // File successfully found.
    (data) => {
      response.writeHead(200, { 'Content-Type': extToType[fileExtension] });
      response.write(data);
      response.end();
    },
    // Error in finding file.
    (err) => {
      throw err;
    });
};


module.exports = {
  HandleFileRequest,
};
