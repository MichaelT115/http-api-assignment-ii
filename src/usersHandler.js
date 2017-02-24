const crypto = require('crypto');

const users = {};

let etag;
let digest;

const updateETag = () => {
  etag = crypto.createHash('sha1').update(JSON.stringify(users));
  digest = etag.digest('hex');
  console.log(`New eTag Digest: ${digest}`);
};

// Returns response with the users json
const respondData = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  // send response with json object
  response.writeHead(status, headers);
  response.write(JSON.stringify({ users }));
  response.end();
};

// Returns response with just the meta data
const respondMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  response.writeHead(status, headers);
  response.end();
};

// Get the user data
const getUsers = (request, response) => {
  // If the client has the same user data (as represented by the eTag digest)
  // then send meta information with status 304.
  if (request.headers['if-none-match'] === digest) {
    return respondMeta(request, response, 304);
  }
  // Else, return with the User Data with status 200.
  return respondData(request, response, 200);
};

// Get the meta data about the user data
const getUsersMeta = (request, response) => {
  // If the client has the same user data (as represented by the eTag digest)
  // then send meta information with status 304.
  if (request.headers['if-none-match'] === digest) {
    return respondMeta(request, response, 304);
  }
  // Else, return with the Meta Data with status 200.
  return respondMeta(request, response, 200);
};

// Adds user to list of users
const addUser = (request, response, user) => {
  const responseJSON = {};  // Sent back to confirm

  // If parameters are missing.
  if (!user.name || !user.age) {
    responseJSON.id = 'missingParams';
    if (!user.name && !user.age) {
      responseJSON.message = 'Missing Name and Age parameters';
    } else if (!user.name) {
      responseJSON.message = 'Missing Name';
    } else if (!user.age) {
      responseJSON.message = 'Missing age';
    }


    // Send back error message
    response.writeHead(400, {
      'Content-Type': 'application/json',
      etag: digest,
    });
    response.write(JSON.stringify({ responseJSON }));
    response.end();
    return;
  }


  // Check if the user already exists
  const userExists = user.name in users;
  console.log(userExists);

  // If the User already exists, set the response code to 204.
  if (!userExists) {
    users[user.name] = {};
  }
  // Add/Update user.
  users[user.name].name = user.name;
  users[user.name].age = user.age;

  updateETag();

  // If a new user was created, Send success message. Status: 201
  if (!userExists) {
    responseJSON.message = 'New User Entry Successfully Created.';
    response.writeHead(201, {
      'Content-Type': 'application/json',
      etag: digest,
    });
    response.write(JSON.stringify({ responseJSON }));
    response.end();
  } else {
    // Else, an existing user updated. Status 204
    response.writeHead(204, {
      'Content-Type': 'application/json',
      etag: digest,
    });
    response.end();
  }
};

// Gets an error page with an error message
const getNotFound = (request, response) => {
  response.writeHead(404, {
    'Content-Type': 'application/json',
    etag: digest,
  });
  response.write(JSON.stringify({
    message: 'The resource was taken by the abyss. Or, maybe it never existed ever...',
    id: 'notFound',
  }));
  response.end();
};

// Gets an error page without error message
const getNotFoundMeta = (request, response) => {
  response.writeHead(404, {
    'Content-Type': 'application/json',
    etag: digest,
  });
  response.end();
};

updateETag();

module.exports = {
  getUsers,
  getUsersMeta,

  addUser,

  getNotFound,
  getNotFoundMeta,
};
