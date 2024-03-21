#Keycloak and LDAP integration with node.js

##Abstract
Simple node.js app that demonstrates authentication of web user (with OTP) and API user (just basic auth) against this online LDAP service:

https://www.forumsys.com/2022/05/10/online-ldap-test-server/

Please note that credentials are hardcoded in various files. Not for production use.

##setup

###1. Infrastructure - Keycloak

Docker-compose file setting up Keycloak instance in DEV mode with Postgres as backend.

Url: http://localhost:8080
Username / password: admin

###2. Keycloak setup

####Realms:
- Realm: Demorealm


####User Ferderation
- User Federation:

####Clients:
- frontend-service: Authentication for web users. Configured OTP
![alt text](<Skærmbillede 2024-03-18 kl. 22.45.51.png>)

- backend-service: Authentication for API users. Basic HTTP auth

![alt text](<Skærmbillede 2024-03-18 kl. 22.46.25.png>)

###3. Environment vars

Use the .env-template as basis for .env file:

AUTH_SERVER_URL=http://localhost:8080/
REALM=Demorealm
SESSION_SECRET="whateveryouwant"
WEB_CLIENT_ID=frontend-service
WEB_CLIENT_SECRET= # optional
API_CLIENT_ID=backend-service
API_CLIENT_SECRET=whateverkeywascreated

###4. Source code

Main files:
- Server.js: Starts the application, sets up session store and routes
- webEndpoints.js: Implements simple webpage that requires authentication
- apiEndpoints.js: Implements simple API that requires basic auth



