const express = require('express')
const router = express.Router()
const { verify } = require('../auth.js')
const spotifyAuth = require('../spotifyAuth.js')

// Spotify Authorization Code Flow
router.get('/', verify, spotifyAuth.requestAuthorization)
router.get('/callback', verify, spotifyAuth.requestAccessToken)
router.get('/refresh-token', verify, spotifyAuth.refreshToken)

// Spotify API Calls

module.exports = router