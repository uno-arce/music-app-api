const express = require('express')
const router = express.Router()
const { verify, verifyAdmin } = ('../auth')
const userController = require('../controllers/userController.js')

router.post('/register', userController.registerUser)


module.exports = router