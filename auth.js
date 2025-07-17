const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

// Secret Keyword
const secret = process.env.SECRET

// Token Creation
module.exports.createAccessToken = (user) => {
	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin
	}

	return jwt.sign(data, secret, {})
} 

// Token Verification
module.exports.verify = (req, res, next) => {
	let token = req.headers.authorization
	if(typeof token === 'undefined') {
		return res.status(400).send({ auth: 'Failed. No Token'} )
	} else {
		token = token.slice(7, token.length)
	}

	jwt.verify(token, secret, function(err, decodedToken) {
		if(err) {
			return res.status(403).send({
				auth:  'Failed',
				message: 'err.message'
			})
		} else {
			req.user = decodedToken
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