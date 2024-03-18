Keycloak and LDAP integration with node.js

Simple node.js app that demonstrates authentication of web user (with OTP) and API user (just basic auth) against this online LDAP service:

https://www.forumsys.com/2022/05/10/online-ldap-test-server/

Please note that credentials are hardcoded in various files. Not for production use.

1. Infrastructure - Keycloak

Docker-compose file setting up Keycloak instance in DEV mode with Postgres as backend.

Url: http://localhost:8080
Username / password: admin

2. Keycloak setup

- Realm: Demorealm
- User Federation:

Clients:
- frontend-service: Authentication for web users. Added OTP

![alt text](<Skærmbillede 2024-03-18 kl. 22.45.51.png>)

- backend-service: Authentication for API users. Basic HTTP auth

![alt text](<Skærmbillede 2024-03-18 kl. 22.46.25.png>)

3. Environment vars

Use the .env-template as basis for .env file:

# Common Keycloak configuration
AUTH_SERVER_URL=
REALM=

# In memory session secret
SESSION_SECRET=""

# Web client configuration
WEB_CLIENT_ID=
WEB_CLIENT_SECRET= # optional

# API Client configuration
API_CLIENT_ID=
API_CLIENT_SECRET=

4. Source code

Main files:
- Server.js: Starts the application
- webEndpoints.js: Demonstrates authentication of web user
- apiEndpoints.js: Demonstrates authentication of API user



