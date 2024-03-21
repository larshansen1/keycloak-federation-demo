//Implements simple Web Page with 2-factor authentication

// Import the Express framework to enable the creation of an HTTP server.
const express = require('express');

// Import Keycloak-connect to integrate Keycloak for secure authentication and authorization.
const Keycloak = require('keycloak-connect');

// Import dotenv to manage environment variables for the application.
require('dotenv').config({ path: '../.env' });

/**
 * Module exports a function that initializes routes and Keycloak configuration.
 * @param {Object} memoryStore - A session store instance for storing session data server-side.
 * @returns {Router} A router object for defining web application routes.
 */
module.exports = function(memoryStore) {
    // Create a new router instance to define routes for the web application.
    const router = express.Router();

    // Define the configuration for the Keycloak client using environment variables.
    const keycloakConfig = {
        clientId: process.env.WEB_CLIENT_ID, // Client ID for the Keycloak client
        bearerOnly: false, // Specifies if the client will only use bearer tokens for authentication
        serverUrl: process.env.AUTH_SERVER_URL, // URL of the Keycloak server
        realm: process.env.REALM, // Keycloak realm name
        credentials: {
            secret: process.env.WEB_CLIENT_SECRET // Secret key for the Keycloak client
        }
    };

    // Initialize the Keycloak adapter with the provided memoryStore and client configuration.
    const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

    /**
     * Middleware to log session data for incoming requests.
     * Useful for debugging and monitoring session states.
     */
    router.use((req, res, next) => {
        console.log('Session data:', req.session);
        next(); // Proceed to the next middleware/route handler
    });

    /**
     * Apply Keycloak middleware to manage user authentication and protect routes.
     * This middleware handles login, logout, and admin functionalities.
     */
    router.use(keycloak.middleware({
        logout: '/logout', // Define the route for user logout
        admin: '/', // Base path for the Keycloak admin console
    }));

    /**
     * Defines a protected route that requires user authentication.
     * Users must be authenticated to access this endpoint.
     */
    router.get('/web/protected', keycloak.protect(), (req, res) => {
        console.log('Accessing protected route');
        // Send a response to the authenticated user
        res.send('Hello Authenticated Web User!');
    });

    // Return the configured router to be used by the Express application.
    return router;
};
