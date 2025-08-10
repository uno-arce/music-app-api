const express = require('express')
const router = express.Router()
const { verify, verifyAdmin } = require('../auth')
const userController = require('../controllers/userController.js')

router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)
router.post('/logout', userController.logoutUser)
router.get('/verify', verify, (req, res) => {
	res.status(200).send({ message: 'User is authenticated'})
})
router.post('/rate-songs', userController.addSongRatings)

module.exports = router