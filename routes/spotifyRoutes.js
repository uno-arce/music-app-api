const express = require('express')
const router = express.router
const spotifyAuth = require('../spotifyAuth.js')

router.get('/', verify, spotifyAuth.requestAuthorization)
router.get('/callback', verify, spotifyAuth.requestAccessToken)
router.get('/refresh-token', verify, spotifyAuth.refreshToken)

module.exports = router