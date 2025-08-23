const request = require('request')
const spotifyAuth = require('../spotifyAuth.js')
const User = require('../models/User')

const spotify_me_url = 'https://api.spotify.com/v1/me'
const spotify_api_base_url = 'https://api.spotify.com/v1'

// Spotify API Data Endpoints
const tracks = '/tracks'
const playlists = '/playlists'
const recentlyPlayed = '/player/recently-played'
const mostlyPlayed = '/top/tracks'
const mostlyListened = '/top/artists'

const tracksLimit = 10
const artistsLimit = 3

module.exports.getSavedTracksFromLibrary = async (req, res) => {
	try {
		const accessToken  = req.user.spotifyAccessToken

		if(!accessToken) {
			return res.status(404).send({ error: 'Spotify access token not found' })
		}

		const authOptions = {
			url: spotify_me_url+tracks,
			headers: {'Authorization': `Bearer ${accessToken}`},
			json: true
		}

		request.get(authOptions, function(error, response, body) {
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

module.exports.getCurrentUsersPlaylists = async (req, res) => {
	try {
		const accessToken  = req.user.spotifyAccessToken

		if(!accessToken) {
			return res.status(404).send({ error: 'Spotify access token not found' })
		}

		const authOptions = {
			url: spotify_me_url+playlists,
			headers: {'Authorization': `Bearer ${accessToken}`},
			json: true
		}

		request.get(authOptions, function(error, response, body) {
			if(!error && response.statusCode === 200) {
				return res.status(200).send(body)
			} else {
				console.error(error)
				return res.status(500).send({ error: 'Failed to fetch user playlists from spotify' + error})
			}
		})

	} catch(dbErr) {
		console.error(dbErr)
		return res.status(500).send({ error: 'Internal server error'})
	}
}

module.exports.getRecentlyPlayedTracks = async (req, res) => {
	try {
		const accessToken  = req.user.spotifyAccessToken

		if(!accessToken) {
			return res.status(404).send({ error: 'Spotify access token not found' })
		}

		const authOptions = {
			url: spotify_me_url+recentlyPlayed,
			headers: {'Authorization': `Bearer ${accessToken}`},
			qs: { limit: tracksLimit },
			json: true
		}

		request.get(authOptions, function(error, response, body) {
			if(!error && response.statusCode === 200) {
				return res.status(200).send(body)
			} else {
				console.log("Error:" + error)
				return res.status(500).send({ error: 'Failed to fetch user recently played tracks'})
			}
		})
	} catch(dbErr) {
		console.log(dbErr)
		return res.status(500).send({ error: 'Internal server error' })
	}
}

module.exports.getMostlyPlayedTracks = async (req, res) => {
	try {
		const accessToken  = req.user.spotifyAccessToken

		if(!accessToken) {
			return res.status(404).send({ error: 'Spotify access token not found' })
		}

		const authOptions = {
			url: spotify_me_url+mostlyPlayed,
			headers: {'Authorization': `Bearer ${accessToken}`},
			qs: { limit: tracksLimit },
			json: true
		}

		request.get(authOptions, function(error, response, body) {
			if(!error || response.statusCode === 200) {
				return res.status(200).send(body)
			} else {
				return res.status(500).send({ error: 'Failed to fetch user mostly played tracks' })
			}
		})

	} catch(dbErr) {
		console.log(dbErr)
		return res.status(500).send({ error: 'Internal server error' })
	}
}

module.exports.getMostlyListenedArtists = async (req, res) => {
	try {
		const accessToken  = req.user.spotifyAccessToken

		if(!accessToken) {
			return res.status(404).send({ error: 'Spotify access token not found' })
		}

		const authOptions = {
			url: spotify_me_url+mostlyListened,
			headers: {'Authorization': `Bearer ${accessToken}`},
			qs: { limit: artistsLimit },
			json: true
		}

		request.get(authOptions, function(error, response, body) {
			if(!error || response.statusCode === 200) {
				return res.status(200).send(body)
			} else {
				return res.status(500).send({ error: 'Failed to fetch user mostly listened artists' })
			}
		}) 
	} catch(dbErr) {
		console.log(err)
		return res.status(500).send({ error: 'Internal server error' })
	}
}