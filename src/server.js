const http = require('http');         // Used to handle the HTTP server
const url = require('url');           // Used to parse URLs
const query = require('querystring'); // Parses query strings in URLs

const htmlHandler = require('./htmlHandler.js');    // Handles basic static content requests like HTML, CSS, client-side JS
const usersHandler = require('./usersHandler.js');  // Interfaces with user data.

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const handleGETRequests = (request, response, pathname) => {
  switch (pathname) {
    case '/':               // Get Homepage's HTML
    case '/client.html':    // Get Homepage's HTML
    case '/style.css':      // Get Style Sheet
      // Handles general requests for static content.
      htmlHandler.HandleFileRequest(request, response);
      break;
    // Get users
    case '/getUsers':
      usersHandler.getUsers(request, response);
      break;
    // When the resource cannot be found
    case '/notReal':
    default:
      usersHandler.getNotFound(request, response);
      break;
  }
};

const handleHEADRequests = (request, response, pathName) => {
  if (pathName === '/getUsers') {
    usersHandler.getUsersMeta(request, response);
  } else {
    usersHandler.getNotFoundMeta(request, response);
  }
};

const HandlePOSTRequests = (request, _response, pathName) => {
  if (pathName === '/addUser') {
    const response = _response;
    const data = [];  // Holds the data streamed by the client.

    // On error, end response with status code
    request.on('error', (err) => {
      console.dir(err);
      response.statusCode = 400;
      response.end();
    });

    // Store data chunks in data.
    request.on('data', (chunk) => {
      data.push(chunk);
    });

    // When done, add the user to the user list.
    request.on('end', () => {
      const userString = Buffer.concat(data).toString();
      const userParameters = query.parse(userString);

      // Add the user
      usersHandler.addUser(request, response, userParameters);
    });
  }
};

const onRequest = (request, response) => {
  const urlObject = url.parse(request.url, true);

  switch (request.method) {
    case 'GET':
      handleGETRequests(request, response, urlObject.pathname);
      break;
    case 'HEAD':
      handleHEADRequests(request, response, urlObject.pathname);
      break;
    case 'POST':
      HandlePOSTRequests(request, response, urlObject.pathname);
      break;
    default:
      usersHandler.getNotFoundMeta(request, response);
      break;
  }
};


http.createServer(onRequest).listen(port);
console.log(`Listening on 127.0.0.1: ${port}`);
