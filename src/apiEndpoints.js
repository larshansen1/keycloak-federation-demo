// Import necessary libraries
const express = require('express'); // Express.js library for building web applications
const axios = require('axios'); // HTTP client for making requests to external services
const basicAuth = require('basic-auth'); // Middleware for parsing Basic Auth headers
const router = express.Router(); // Create a new router object for defining HTTP routes

// Load environment variables from .env file for secure and configurable application settings
require('dotenv').config({ path: '../.env' });

// Define constants for the Keycloak server and client configuration
const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL; // URL of the Keycloak server
const REALM = process.env.REALM; // Keycloak realm name
const CLIENT_ID = process.env.API_CLIENT_ID; // Client ID for the API client in Keycloak
const CLIENT_SECRET = process.env.API_CLIENT_SECRET; // Client secret for secure communication with Keycloak

// Construct the URL to Keycloak's token endpoint for the specified realm
const KEYCLOAK_URL = `${AUTH_SERVER_URL}realms/${REALM}/protocol/openid-connect/token`;

// Define a route for a protected API endpoint
router.get('/api/protected', async (req, res) => {
  // Attempt to extract Basic Auth credentials from the request
  const credentials = basicAuth(req);
  
  // If no credentials are provided, return a 401 Unauthorized response
  if (!credentials) {
    return res.status(401).json({ message: 'Missing Authorization Header' });
  }

  try {
    // Request an access token from Keycloak using the provided credentials
    const tokenResponse = await axios.post(KEYCLOAK_URL, new URLSearchParams({
      'grant_type': 'password', // Grant type for password-based authentication
      'client_id': CLIENT_ID, // Client ID
      'client_secret': CLIENT_SECRET, // Client secret
      'username': credentials.name, // Username from Basic Auth
      'password': credentials.pass, // Password from Basic Auth
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' } // Set content type header
    });

    // Respond with a success message if authentication is successful
    res.json({ message: 'Hello Authenticated API User!' });
  } catch (error) {
    // Log the authentication error and return a 401 Unauthorized response if authentication fails
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
});

// Export the router to be used in the main application file
module.exports = router;
