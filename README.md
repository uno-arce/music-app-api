An API that features track rating, track preview streaming, and personal track history utilizing the Spotify Web API. It has user authentication and secure oauth2 authorization. Users can persistently access their saved rated tracks through mongodb. 

## Functionalities
**Key Functionalities**
- User Authentication
- OAuth2 Authorization
- No-SQL Database Management
- Rest API
- CRUD

**Other Functionalities**
- Unit Testing

## What's Inside
**Folder Structure**  
```
-- src  
├── controllers  
├── models  
├── routes
```

**Dependencies**
| Package | Purpose |
| --- | --- |
| `bcryptjs` | Password hashing and security |
| `mocha/chai` | Testing framework and assertion library |
| `cookie-parser` | Parsing cookies attached to client requests |
| `cors` | Enabling Cross-Origin Resource Sharing |
| `crypto` | Built-in module for cryptographic functionality |
| `dotenv` | Managing environment variables from .env files |
| `express` | Web application framework for Node.js |
| `jsonwebtoken` | Securely transmitting information as a JSON object |
| `mongoose` | MongoDB object modeling for Node.js |
| `querystring` | Parsing and formatting URL query strings |
| `spotify-preview-finder` | Integrating Spotify metadata and track previews |

## How to Use The API
_Note: This app is designed for local development. Due to Spotify's policy, you must provide your own client id by creating an app at https://developer.spotify.com/dashboard and have a Spotify Premium account to access the API features_
1. Clone the app to your local repository
2. Get your spotify client id and secret in your spotify web dashboard
3. Get your mongodb uri in your mongodb cluster
4. Setup your Spotify Callback in your frontend
5. Plug and use the routes in your frontend
