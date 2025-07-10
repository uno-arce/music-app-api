const bcrypt = require('bcryptjs')
const auth = require('../auth')
const User = require('../models/User')

module.exports.registerUser = async (req, res) => {
	// username should be compose of string and number/symbols
	const reqUsername = +req.body.username // converts string to number
	if(!isNaN(reqUsername)) {
		return res.status(400).send({ error: 'Invalid username'})
	}

	// username should contain atleast one character and number
	const alphanumericRegex = /[a-zA-Z0-9]/;
	if(!alphanumericRegex.test(req.body.username)) {
		return res.status(400).send({ error: 'Invalid username'})

	}

	// email should be unique
	if(await User.findOne({ email: req.body.email })) {
		return res.status(409).send({ error: "Email was already taken"})
	}

	// email should contain @ and .com at the end
	const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
	if(!emailRegex.test(req.body.email)) {
		return res.status(400).send({ error: 'Invalid email format: Please provide a valid email address (e.g., user@example.com)' })
	}

	// password should contain a string and atleast one symbol and number
	const passwordHasNumber = /\d/;
	const passwordHasSymbol = /[^\w\s]/;
	if(!passwordHasNumber.test(req.body.password) || !passwordHasSymbol.test(req.body.password)) {
		return res.status(400).send('Password must contain atleast one symbol and number')
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
		.then((user) => res.status(201).send({
			message: 'User registered successfully', 
			username: reqUsername, 
			email: user.email,
			_id: user._id
		}))
		.catch(err  => res.status(500).send({ error: 'Error in Saving'}))
	}
}

module.exports.loginUser = async (req, res) => {
	try {
		const user = await User.findOne( {email: req.body.email })

		// email should be valid and must contain @ and .com
		const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
		if(!emailRegex.test(req.body.email)) {
			return res.status(400).send({ error: 'Invalid email format: Please provide a valid email address (e.g., user@example.com)'})
		}

		// password should be correct
		else if(!bcrypt.compareSync(user.password), req.body.password) {
			return res.status(400).send({ error: 'Incorrect email or password'})
		}

		else {
			return res.status(200).send({ access: createAccessToken(user), message: "User login successfully"})
		}
	} catch(err) {
		res.status(500).send({ error: 'Error on logging in' })
	}
}