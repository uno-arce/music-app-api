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
const spotify_authorize_url = 'https://accounts.spotify.com/authorize?'
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
const requestAuthorization = (req, res) => {
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
const requestAccessToken = (req, res) => {
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        return res.redirect('http://127.0.0.1:5173/spotify-callback#' +
            querystring.stringify({
                error: 'state_mismatch'
            })
        );
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

		request.post(authOptions, function(error, response, body) {
			if(!error && response.statusCode === 200) {
				const {access_token, refresh_token, expires_in} = body

				return res.redirect('http://127.0.0.1:5173/spotify-callback#' +
					querystring.stringify({
						access_token: access_token,
						refresh_token: refresh_token,
						expires_in: expires_in
					})
				)
			} else {
				return res.redirect('http://127.0.0.1:5173/spotify-callback#' +
					querystring.stringify({
						error: 'invalid_token'
					})
				)
			}
		})
	}
}

// Refresh Access Token
const refreshToken = async (refreshTokenFromDb) => {
	const authOptions  = {
		url: spotify_token_url,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')) 
		},
		form: {
			grant_type: 'refresh_token',
			refresh_token: refreshTokenFromDb
		},
		json: true
	}

	return new Promise((resolve, reject) => {
		request.post(authOptions, async function(error, response, body) {
			if (!error && response.statusCode === 200) {
				const { access_token, refresh_token, expires_in } = body
				const expirationDate = new Date(Date.now() + expires_in * 1000)

				resolve({
					accessToken: access_token,
					newRefreshToken: refresh_token || refreshTokenFromDb,
					expirationDate
				})
			} else {
				reject(new Error('Token refresh failed'))
			}
		})
	})
}

const saveSpotifyTokens = async (req, res) => {
	const userId = req.user.id
	const { accessToken, refreshToken, expiresIn } = req.body
	const expirationDate = new Date(Date.now() + expiresIn * 1000)

	try {
		await User.findOneAndUpdate({ _id: userId }, {
			spotifyAccessToken: accessToken,
			spotifyRefreshToken: refreshToken,
			spotifyAccessTokenExpiration: expirationDate
		}, {
			upsert: true,
			new:  true,
			setDefaultOnInsert: true
		})

		return res.status(200).send({ message: 'Update successful'})
	} catch(dbErr) {
		console.log(dbErr)
		return res.status(500).send({ error: 'Error in updating database' + error})
	}
}

const verifyTokenExpiration = async (req, res, next) => {
	const user = await User.findById(req.user.id)
	const userId = req.user.id

	if(!user || !user.spotifyAccessToken) {
		return res.status(400).send({ error: 'No authorization found'})
	}

	if(new Date() > user.spotifyAccessTokenExpiration) {
		try {
			const { accessToken, newRefreshToken, expirationDate } = await refreshToken(user.spotifyRefreshToken)

			await User.findOneAndUpdate({ _id: userId },
				{
					spotifyAccessToken: accessToken,
					spotifyRefreshToken: newRefreshToken,
					spotifyAccessTokenExpiration: expirationDate

				},{
					upsert: true,
					new:  true,
					setDefaultOnInsert: true

				})
			req.user.spotifyAccessToken = accessToken
			next()
		} catch(dbErr) {
			console.log(dbErr)
			return res.status(500).send({ error: 'Failed to refresh token'})
		}
	} else {
		req.user.spotifyAccessToken = user.spotifyAccessToken
		next()
	}
}

const verifyUserAuthorization = async (req, res) => {
	const user = await User.findById(req.user.id)

	if(!user.spotifyAccessToken) {
		return res.status(400).send({ error: 'No authorization found' })
	}

	return res.status(200).send({ message: 'User is authorized to spotify' })
}

module.exports = {
	requestAuthorization,
	requestAccessToken,
	refreshToken,
	saveSpotifyTokens,
	verifyTokenExpiration,
	verifyUserAuthorization
}