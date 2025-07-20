const spotifyAuth = require('../spotifyAuth.js')
const User = require('../models/User')

const { spotify_api_base_url, spotify_me_url } = require('../spotifyAuth')

// Spotify API Data Endpoints
const tracks = '/tracks'

module.exports.getSavedTracksFromLibrary = async (req, res) => {
	try {
		const userId = req.user.id 

		const user = await User.findById(userId)

		if(!user || !user.spotifyAccessToken) {
			return res.status(404).send({ error: 'Spotify access token not found'})
		}

		const authOptions = {
			url: spotify_me_url+tracks,
			headers: {'Authorization': `Bearer ${user.spotifyAccessToken}`},
			json: true
		}

		request.post(authOptions, function(error, response, body) {
			if(!error && response.statusCode === 200) {
				return res.status(200).send(body)
			} else {
				console.error(error)
				return res.status(500).send({ error: 'Failed to fetch saved tracks from spotify' + error})
			}
		})
	} catch(dbErr) {
		console.error(dbErr)
		return res.status(500).send({ error: 'Internal server error'})
	}
}