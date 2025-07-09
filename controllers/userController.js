const bcrypt = require('bcryptjs')
const auth = require('../auth')
const User = require('../models/User')

module.exports.registerUser = (req, res) => {
	// username should be compose of string and number/symbols
	let reqUsername = +req.body.username // converts string to number
	if(!isNaN(reqUsername)) {
		return res.status(400).send({ error: 'Invalid username'})
	}

	// email should contain @ symbol
	if(!req.body.email.includes('@')) {
		return res.status(400).send({ error: 'Invalid email'})
	}

	// password should be atleast 6 characters
	else if(req.body.password.length < 6) {
		return res.status(400).send({ error: "Password must be atleast 6 characters"})
	}

	else {
		let newUser = new User({
			username: req.body.username,
			email: req.body.email,
			password: bcrypt.hashSync(req.body.password, 10)
		})
		newUser.save()
		.then((user) => res.status(201).send({ message: 'User registered successfully', username: reqUsername}))
		.catch(err  => res.status(500).send({ error: 'Error in Saving'}))
	}
}