const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const bodyParser = require('body-parser');
require('dotenv').config({ path: '../.env' });

const app = express();

app.use(bodyParser.json()); // Middleware to parse JSON bodies, making them easily accessible in req.body

// Logging middleware for all requests
// Logs every incoming request with its method and URL, which is helpful for debugging and monitoring
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next(); // Ensures the control flows to the next middleware or route handler
});

// Include modular route handlers for web and API endpoints
const webEndpoints = require('./webEndpoints');// Web routes module
const apiEndpoints = require('./apiEndpoints'); // API routes module

app.use('/', webEndpoints); // Mount webEndpoints at the root path
app.use('/', apiEndpoints); // Mount apiEndpoints at the root path

// Middleware for error logging and handling
// This catches any errors that occur during the processing of requests, logging them and returning a generic error message
app.use((error, req, res, next) => {
  console.error(`Error processing request ${req.method} ${req.url}: ${error.message}`);
  res.status(500).send('Unexpected error'); // Prevents leaking of error details to the client
});

// Start the server and listen on port 3000
// Logs a message once the server is ready and listening for requests
const server = app.listen(3000, () => {
  console.log(`App listening at http://localhost:${server.address().port}`);
});
