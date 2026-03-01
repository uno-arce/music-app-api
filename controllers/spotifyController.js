const request = require('request')
const dotenv = require('dotenv')
const spotifyAuth = require('../spotifyAuth.js')
const User = require('../models/User')
const spotifyPreviewFinder = require('spotify-preview-finder')

const spotify_me_url = 'https://api.spotify.com/v1/me'
const spotify_api_base_url = 'https://api.spotify.com/v1'

// Spotify API Data Endpoints
const tracks = '/tracks'
const playlists = '/playlists'
const recentlyPlayed = '/player/recently-played'
const mostlyPlayed = '/top/tracks'
const mostlyListened = '/top/artists'

const tracksLimit = 10
const artistsLimit = 10
const savedTracksLimit = 50
const playlistsLimit = 10

dotenv.config()

module.exports.getSavedTracksFromLibrary = async (req, res) => {
	try {
		const accessToken  = req.user.spotifyAccessToken

		if(!accessToken) {
			return res.status(404).send({ error: 'Spotify access token not found' })
		}

		const authOptions = {
			url: spotify_me_url+tracks,
			headers: {'Authorization': `Bearer ${accessToken}`},
			qs: { limit: savedTracksLimit },
			json: true
		}

		request.get(authOptions, function(error, response, body) {
			if(!error && response.statusCode === 200) {
				const groupedList = {}
				let group = 1
				let list = []
				body.items.forEach(item => {
					list.push({
						track: item.track.name,
						image: item.track.album.images[0].url,
						album: item.track.album.name,
						artist: item.track.artists[0].name,
						releaseDate: item.track.album.release_date,
						reference: item.track.external_urls.spotify
					})

					if(list.length == 10) {
						list = []
						group++
					}

					groupedList[group] = list
				})
				return res.status(200).send(groupedList)
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
				const recentlyPlayedTracks = []
				body.items.forEach(item => {
					recentlyPlayedTracks.push({
						id: item.track.id,
						track: item.track.name,
						image: item.track.album.images[0].url,
						album: item.track.album.name,
						artist: item.track.artists[0].name,
						releaseDate: item.track.album.release_date,
						reference: item.track.external_urls.spotify
					})
				})
				return res.status(200).send(recentlyPlayedTracks)
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
				const mostlyPlayedTracks = []
				body.items.forEach(item => {
					mostlyPlayedTracks.push({
						track: item.name,
						image: item.album.images[0].url,
						album: item.album.name,
						artist: item.artists[0].name,
						reference: item.external_urls.spotify
					})
				})
				return res.status(200).send(mostlyPlayedTracks)
			} else {
				return res.status(500).send({ error: 'Failed to fetch user mostly played tracks' })
			}
		})

	} catch(dbErr) {
		console.log(dbErr)
		return res.status(500).send({ error: 'Internal server error' })
	}
}

module.exports.getSpotifyPreviewUrlByEnhanceSearch = async (req, res) => {
	try {
		const trackDetails = req.body.trackDetails 

		const result = await spotifyPreviewFinder(trackDetails.name, trackDetails.artist)

		if(result.success == false) {
			return res.status(404).send({ error: 'Spotify preview url not found' })
		}

		const trackPreviewDetails = {
			previewUrl: result.results[0].previewUrls[0],
			durationMs: result.results[0].durationMs
		}

		return res.status(200).send(trackPreviewDetails)
	} catch (dbErr) {
		console.log(dbErr)
		return res.status(500).send({ error: 'Internal server error' })
	}
}