const express = require('express')
const router = express.Router()
const { verify, verifyAdmin } = ('../auth')
const userController = require('../controllers/userController.js')
const spotifyAuth = require('../spotifyAuth.js')

router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)


module.exports = router