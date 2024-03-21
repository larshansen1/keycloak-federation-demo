const express = require('express');
const axios = require('axios');
const basicAuth = require('basic-auth');
require('dotenv').config({ path: '../.env' });

// Initialize a simple in-memory cache to store Keycloak authentication tokens.
let tokenCache = {};

// The module exports a function that takes a memoryStore parameter, allowing for session management.
module.exports = function(memoryStore) {
    const router = express.Router();

    // Configuration variables for Keycloak are loaded from environment variables.
    const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL; // The base URL of the Keycloak server.
    const REALM = process.env.REALM; // The specific realm within Keycloak to authenticate against.
    const CLIENT_ID = process.env.API_CLIENT_ID; // The client ID as registered in Keycloak.
    const CLIENT_SECRET = process.env.API_CLIENT_SECRET; // The client secret for secure communication with Keycloak.
    const KEYCLOAK_URL = `${AUTH_SERVER_URL}realms/${REALM}/protocol/openid-connect/token`; // The full URL to the token endpoint.

    // Defines a protected API endpoint that requires authentication.
    router.get('/api/protected', async (req, res) => {
        // Attempts to extract Basic Authentication credentials from the incoming request.
        const credentials = extractCredentials(req);
        // If credentials are missing, respond with a 401 Unauthorized status.
        if (!credentials) {
            return res.status(401).json({ message: 'Missing Authorization Header' });
        }

        // Generates a unique cache key based on the user's credentials.
        const cacheKey = generateCacheKey(credentials);
        // Attempts to retrieve a cached token using the generated cache key.
        const cachedToken = tokenCache[cacheKey];

        // If a valid token is found in the cache, use it without re-authenticating.
        if (isTokenValid(cachedToken)) {
            logToken(cachedToken); // Logs the decoded token for instructional purposes.
            return res.json({ message: 'Hello Authenticated API User!' });
        }

        // Authenticate with Keycloak and handle the token response or errors.
        await authenticateWithKeycloak(credentials, cacheKey, KEYCLOAK_URL, CLIENT_ID, CLIENT_SECRET, res);
    });

    return router;
};

// Extracts Basic Auth credentials from the request header.
function extractCredentials(req) {
    return basicAuth(req);
}

// Generates a cache key from the Basic Auth credentials.
function generateCacheKey(credentials) {
    return `${credentials.name}:${credentials.pass}`;
}

// Checks if the cached token is still valid based on its expiration time.
function isTokenValid(cachedToken) {
    return cachedToken && cachedToken.expires > Date.now();
}

// Decodes and logs the JWT header and payload for educational purposes.
function logToken(cachedToken) {
    const parts = cachedToken.token.split('.');
    if (parts.length === 3) {
        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf8'));
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        
        console.log('Token Header:', JSON.stringify(header));
        console.log('Token Payload:', JSON.stringify(payload));
    }
}

// Handles authentication with Keycloak using the provided credentials and configuration.
async function authenticateWithKeycloak(credentials, cacheKey, keycloakUrl, clientId, clientSecret, res) {
    try {
        const tokenResponse = await requestNewToken(credentials, keycloakUrl, clientId, clientSecret);
        cacheToken(cacheKey, tokenResponse.data); // Cache the new token.
        res.json({ message: 'Hello Authenticated API User!' }); // Respond to the client upon successful authentication.
    } catch (error) {
        console.error('Authentication error:', error); // Log any authentication errors.
        res.status(401).json({ message: 'Authentication failed' }); // Respond with an error if authentication fails.
    }
}

// Requests a new token from Keycloak using the Axios HTTP client.
async function requestNewToken(credentials, keycloakUrl, clientId, clientSecret) {
    return axios.post(keycloakUrl, new URLSearchParams({
        'grant_type': 'password',
        'client_id': clientId,
        'client_secret': clientSecret,
        'username': credentials.name,
        'password': credentials.pass,
    }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
}

// Caches the new token along with its expiration time.
function cacheToken(cacheKey, data) {
    const expiresInMs = data.expires_in * 1000; // Convert the expiration duration to milliseconds.
    tokenCache[cacheKey] = {
        token: data.access_token, // Store the access token in the cache.
        expires: Date.now() + expiresInMs // Calculate and store the future expiration timestamp.
    };
}