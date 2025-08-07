const express = require('express')
const router = express.Router()
const { verify, verifyAdmin } = require('../auth')
const userController = require('../controllers/userController.js')
const spotifyAuth = require('../spotifyAuth.js')

router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)
router.post('/logout', userController.logoutUser)
router.get('/verify', verify)
router.post('/rate-songs', userController.addSongRatings)

module.exports = router