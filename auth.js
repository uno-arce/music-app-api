const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

// Secret Keyword
const secret = process.env.SECRET

// Token Creation
module.exports.createAccessToken = (user, res) => {
	const data = {
		id: user._id,
		email: user.email,
		username: user.username
	}
	
	const token = jwt.sign(data, secret, {})

	res.cookie('authToken', token, {
		httpOnly: true,
		secure: 'production',
		sameSite:  'strict'
	})

	return token
} 

// Token Verification
module.exports.verify = (req, res, next) => {
	let token = req.cookies.authToken

	if(!token ) {
		return res.status(400).send({ auth: 'Failed. No Token'} )
	}

	jwt.verify(token, secret, function(err, decodedToken) {
		if(err) {
			return res.status(403).send({
				auth:  'Failed',
				message: 'err.message'
			})
		} else {
			req.user = decodedToken
			res.status(200).send({ message: 'User is authenticated'})
			next()
		}
	})
}

// Admin Verification
module.exports.verifyAdmin = (req, res, next) => {
	if(req.user.isAdmin) {
		next()
	} else {
		return res.status(403).send({
			auth: 'Failed',
			message: 'Action Forbidden'
		})
	}
}