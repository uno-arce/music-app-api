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
const spotify_token_url = 'htpps://accounts.spotify.com/api/token'
const spotify_me_url = 'https://api.spotify.com/v1/me'


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

	const scope = 'user-read-private user-read-email'
	res.redirect(spotify_authorize_url +
		querystring.stringify({
			response_type: 'code',
			client_id: client_id,
			scope: scope,
			redirect_uri: redirect_uri,
			state: state
		})
	)
}

// Request Access Token
module.exports.requestAccessToken = (req, res) => {
	const code = req.query.code || null
	const state = req.query.state || null
	const storedState = req.cookies ? req.cookies[stateKey] : null

	if (state === null || state !== storedState) {
		res.redirect('/#' +
			querystring.stringify({
				error: 'state_mismatch'
			})
		)
	} else {
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
		const userId = req.user._id

		if(!userId) {
			return res.redirect('/#' + querystring.stringify({ error: 'Authentication required'}))
		}

		request.post(authOptions, function(error, response, body) {
			if(!error && response.statusCode === 200) {
				const {access_token, refresh_token, expires_in} = body

				const options = {
					url: spotify_me_url,
					headers: { 'Authorization': 'Bearer ' + access_token},
					json: true
				}

				request.get(options, async function(error, response, body)  {
					try {
						const user = await User.findOneAndUpdate({userId},
							{
								accessToken: access_token,
								refresh_token: refresh_token,
								accessTokenExpiration: new Date(Date.now() + expires_in * 1000)
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

						res.redirect('/#' +
							querystring.stringify({
								access_token: access_token,
								refresh_token: refresh_token
								message: 'Spotify linked successfully'
							})
						)
					}  catch (dbErr) {
						res.redirect('/#' +
							querystring.stringify({
								error: 'Database error'
							})
						)
					}
				})
			} else {
				res.redirect('/#' +
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
	const userId = req.user._id
	
	try {
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
				refresh_token: refresh_token
			},
			json: true
		}

		request.post(authOptions, function(error, response, body) {
			if (!error && response.statusCode === 200) {
				const access_token = body.access_token,
				const new_refresh_token = body.refresh_token || refresh_token_from_client
				const expires_in = body.expires_in

				res.send({
					'access_token': access_token,
					'refresh_token': refresh_token,
					'expires_in': expires_in
				})
			} else {
				return res.status(response ? response.statusCode : 500).send({
					error: 'Token refresh failed'
				})
			}
		})
	} catch(dbErr) {
		res.status(500).send({ error: 'Database error'})
	}
}