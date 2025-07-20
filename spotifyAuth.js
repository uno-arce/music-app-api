const request = require('request')
const crypto = require('crypto')
const querystring = require('querystring')
const dotenv = require('dotenv')
const User = require('./models/User')

dotenv.config()

const client_id = process.env.CLIENT_ID
const client_secret = process.env.CLIENT_SECRET
const redirect_uri = process.env.REDIRECT_URI

// Spotify API Endpoints
const spotify_authorize_url = 'https://accounts.spotify.com/authorize'
const spotify_token_url = 'https://accounts.spotify.com/api/token'
const spotify_me_url = 'https://api.spotify.com/v1/me'
const spotify_api_base_url = 'https://api.spotify.com/v1'


const generateRandomString = (length) => {
	return crypto
	.randomBytes(60)
	.toString('hex')
	.slice(0, length)
}

const stateKey = 'spotify_auth_state'

// Request Authorization
module.exports.requestAuthorization = (req, res) => {
	const state = generateRandomString(16)
	res.cookie(stateKey, state)

	const scope = 'user-read-private user-read-email user-read-recently-played user-top-read user-library-read playlist-read-private playlist-read-collaborative'
	res.redirect(spotify_authorize_url +
		querystring.stringify({
			response_type: 'code',
			client_id: client_id,
			scope: scope,
			redirect_uri: redirect_uri,
			state: state,
		})
	)
}

// Request Access Token
module.exports.requestAccessToken = (req, res) => {
	console.log('--- Inside requestAccessToken function ---')
    console.log('Raw Request Headers:', req.headers)
    console.log('Request Query:', req.query)
    console.log('Request Cookies:', req.cookies)

    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies[stateKey] : null;

    console.log(`Code: ${code}, State: ${state}, StoredState: ${storedState}`);

    if (state === null || state !== storedState) {
        console.log('State mismatch detected. Redirecting.');
        return res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            })
        );
    } else {
		const userId = req.user.id

		console.log(req.user)

		if(!userId) {
			return res.redirect('/#' + querystring.stringify({ error: 'Authentication required'}))
		}

		res.clearCookie(stateKey)

		const authOptions = {
			url: spotify_token_url,
			form: {
				code: code,
				redirect_uri: redirect_uri,
				grant_type: 'authorization_code'
			},
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'Basic '  + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
			},
			json: true
		}

		console.log('authOptions being sent to Spotify token endpoint:', authOptions.form);
		request.post(authOptions, function(error, response, body) {
			if(!error && response.statusCode === 200) {
				const {access_token, refresh_token, expires_in} = body

				const options = {
					url: spotify_me_url,
					headers: { 'Authorization': 'Bearer ' + access_token},
					json: true
				}

				request.get(options, async function(error, response, body)  {
					if (error) {
                        console.error('Error during Spotify /me GET request:', error);
                        return res.redirect('/#' +
                            querystring.stringify({
                                error: 'network_or_me_request_error',
                                details: error.message
                            })
                        );
                    }
                    if (response.statusCode !== 200) {
                        console.error(`Spotify /me GET request failed with status ${response.statusCode}. Body:`, body);
                        return res.redirect('/#' + 
                            querystring.stringify({
                                error: 'spotify_me_api_error',
                                details: body
                            })
                        );
                    }

					try {
						const user = await User.findOneAndUpdate({ _id: userId},
							{
								spotifyAccessToken: access_token,
								spotifyRefreshToken: refresh_token,
								spotifyAccessTokenExpiration: new Date(Date.now() + expires_in * 1000)
							},
							{
								upsert: true,
								new:  true,
								setDefaultOnInsert: true
							}
						)

						if(!user) {
							return res.redirect('/#'  + querystring.stringify({error: 'User not found'}))
						}

						return res.redirect('/#' +
							querystring.stringify({
								access_token: access_token,
								refresh_token: refresh_token,
								message: 'Spotify linked successfully'
							})
						)
					}  catch (dbErr) {
						return res.redirect('/#' +
							querystring.stringify({
								error: 'Database error'
							})
						)
					}
				})
			} else {
				return res.redirect('/#' +
					querystring.stringify({
						error: 'invalid_token'
					})
				)
			}
		})
	}
}

// Refresh Access Token
module.exports.refreshToken = async (req, res) => {
	const userId = req.user.id
	
	const refresh_token_from_client = req.query.refresh_token

	if(!refresh_token_from_client) {
		return res.status(400).send({ error: 'Refresh token missing'})
	}

	const authOptions  = {
		url: spotify_token_url,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')) 
		},
		form: {
			grant_type: 'refresh_token',
			refresh_token: refresh_token_from_client
		},
		json: true
	}

	request.post(authOptions, async function(error, response, body) {
		if (!error && response.statusCode === 200) {
			const access_token = body.access_token
			const new_refresh_token = body.refresh_token || refresh_token_from_client
			const expires_in = body.expires_in

			try {
				const updatedUser = await User.findOneAndUpdate({ _id: userId },
				{
					spotifyAccessToken: access_token,
					spotifyRefreshToken: new_refresh_token,
					spotifyAccessTokenExpiration: new Date(Date.now() + expires_in * 1000)

				},{
					upsert: true,
					new:  true,
					setDefaultOnInsert: true

				})

				console.log(updatedUser)

				return res.status(200).send({
					'access_token': access_token,
					'refresh_token': new_refresh_token,
					'expires_in': expires_in
				})
			} catch (dbErr) {
				console.error(dbErr)
			}
		} else {
			return res.status(response ? response.statusCode : 500).send({
				error: 'Token refresh failed'
			})
		}
	})
}