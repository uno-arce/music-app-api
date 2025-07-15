const request = require('request')
const crypto = require('cryto')
const queryString = require('querystring')
const dotenv = require('dotenv')
const { app, mongoose } = require('../index.js')

dotenv.config()

const client_id = process.env.CLIENT_ID
const client_secret = process.env.CLIENT_SECRET


const generateRandomString = (length) => {
	return crypto
	.randomBytes(60)
	.toString('hex')
	.slice(0, length)
}

const stateKey = 'spotify_auth_state'

