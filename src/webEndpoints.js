// Import necessary modules
const express = require('express'); // Express framework for building web applications
const session = require('express-session'); // Middleware for handling sessions in Express applications
const Keycloak = require('keycloak-connect'); // Keycloak's middleware for integrating authentication and authorization

require('dotenv').config({ path: '../.env' });
// Loads environment variables from a .env file

const router = express.Router(); // Create a new router object to manage routes

// Initialize session support for the web application
// This sets up an in-memory session store and configures session behavior
const memoryStore = new session.MemoryStore();
router.use(session({
  secret: process.env.SESSION_SECRET, // The secret used to sign the session ID cookie, enhancing security
  resave: false, // Prevents the session from being saved back to the session store if it hasn't been modified
  saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store, useful for creating sessions
  store: memoryStore // Specifies the session store instance, here an in-memory store (not recommended for production)
}));

// Keycloak client configuration using environment variables for flexibility and security
const keycloakConfig = {
  clientId: process.env.WEB_CLIENT_ID, // The client ID for the web application registered in Keycloak
  bearerOnly: false, // This application serves both as a client and a resource server, hence false
  serverUrl: process.env.AUTH_SERVER_URL, // URL of the Keycloak server
  realm: process.env.REALM, // The Keycloak realm under which the client is registered
  credentials: {
    secret: process.env.WEB_CLIENT_SECRET // Client secret for secure communication with Keycloak
  }
};

// Initialize the Keycloak adapter with the specified configuration and session store
const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

// Apply Keycloak middleware to manage user authentication and secure routes
// This includes handling for logout and administrative functions out-of-the-box
router.use(keycloak.middleware({
  logout: '/logout', // Defines the route for logging out users, integrating with Keycloak's logout mechanism
  admin: '/', // Route for Keycloak's administrative functions, typically used for admin console redirection
}));

// Example of a protected route that requires user authentication
// The `keycloak.protect()` middleware ensures that only authenticated users can access this route
router.get('/web/protected', keycloak.protect(), (req, res) => {
  console.log('Accessing protected route'); // Log access for monitoring or auditing purposes
  res.send('Hello Authenticated Web User!'); // Response sent to authenticated users, can be customized as needed
});

// Export the router configuration to be used in the main application file
// This modular approach helps in organizing route logic and middleware
module.exports = router;
