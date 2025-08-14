const express = require('express')
const router = express.Router()
const { verify } = require('../auth.js')
const spotifyAuth = require('../spotifyAuth.js')
const spotifyController = require('../controllers/spotifyController.js')

// Spotify Authorization Code Flow
router.get('/', spotifyAuth.requestAuthorization)
router.get('/callback', spotifyAuth.requestAccessToken)
router.get('/refresh-token', verify, spotifyAuth.verifyTokenExpiration)
router.get('/verify-authorization', verify, spotifyAuth.verifyUserAuthorization)
router.post('/save-tokens', verify, spotifyAuth.saveSpotifyTokens)

// Spotify API Calls
router.get('/saved-tracks', verify, spotifyController.getSavedTracksFromLibrary)
router.get('/playlists', verify, spotifyController.getCurrentUsersPlaylists)

router.get(
	'/recently-played', 
	verify, 
	spotifyAuth.verifyTokenExpiration, 
	spotifyController.getRecentlyPlayedTracks)

router.get('/mostly-played', verify, spotifyController.getMostlyPlayedTracks)
router.get('/mostly-listened', verify, spotifyController.getMostlyListenedArtists)

module.exports = router