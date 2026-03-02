An API that features track rating, track preview streaming, and personal track history utilizing the Spotify Web API. It has user authentication and secure oauth2 authorization. Users can persistently access their saved rated tracks through mongodb. 

## How to Use The API
_Note: This app is designed for local development. Due to Spotify's policy, you must provide your own client id by creating an app at https://developer.spotify.com/dashboard and have a Spotify Premium account to access the API features_
1. Clone the app to your local repository
2. Get your spotify client id and secret in your spotify web dashboard
3. Get your mongodb uri in your mongodb cluster
4. Setup your Spotify Callback in your frontend
5. Plug and use the routes in your frontend

## What's Inside
**Folder Structure**  
-- src  
&emsp;-- controllers  
&emsp;-- models  
&emsp;-- routes  

**Dependencies**
- BcryptJS
- Mocha/MochaChai
- Cookie Parser
- Cors
- Crypto
- Dotenv
- Express
- JSONWebToken
- Mongoose
- Querystring
- Spotify Preview Finder
## Functionalities
**Key Functionalities**
- User Authentication
- OAuth2 Authorization
- No-SQL Database Management
- Rest API
- CRUD

**Other Functionalities**
- Unit Testing
- Model Schema Creation
