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
		return res.status(400).send({ error: 'Password must contain atleast one symbol and number'})
	}

	// password should be atleast 6 characters
	if(req.body.password.length < 6) {
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
			username: user.username, 
			email: user.email,
			_id: user._id
		}))
		.catch(err  => res.status(500).send({ error: 'Error in Saving'}))
	}
}

module.exports.loginUser = async (req, res) => {
	try {
		// email should be valid and must contain @ and .com
		const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
		if(!emailRegex.test(req.body.email)) {
			return res.status(400).send({ error: 'Invalid email format: Please provide a valid email address (e.g., user@example.com)'})
		}

		// user should be registered to the app
		const user = await User.findOne( {email: req.body.email })
		if(!user) {
			return res.status(400).send({ error: 'Incorrect email or password'})
		}


		// password should be correct
		if(!bcrypt.compareSync(req.body.password, user.password)) {
			return res.status(400).send({ error: 'Incorrect email or password'})
		}

		const token = auth.createAccessToken(user, res)

		return res.status(200).send({ message: "User login successfully"})
	} catch(err) {
		console.log(err)
		res.status(500).send({ error: 'Error on logging in' })
	}
}

module.exports.logoutUser = async (req, res) => {
	try {
		res.clearCookie('authToken', {
			httpOnly: true,
			secure: 'production',
			sameSite: 'strict'
		})

		const token = req.cookies.authToken

		return res.status(200).send({ message: 'User logged off successfully', authToken: token })
	} catch(err) {
		return res.status(400).send({ error: 'Logout unsuccessful'})
	}
}

module.exports.addSongRatings = async (req, res) => {
	try {
		const userId = req.user.id
		const ratedSongs = req.body.ratedSongs

		if (!Array.isArray(ratedSongs) || ratedSongs.length === 0) {
            return res.status(400).send({ error: 'Invalid or empty "ratedSongs" array provided in the request body' });
        }

		const user = await User.findById(userId)

		if(!user || !user.spotifyAccessToken) {
			return res.status(404).send({ error: 'Spotify access token not found'})
		}

		ratedSongs.forEach(newSongRating => { 
            const { name, genre, rating } = newSongRating;

            if (!name || typeof name !== 'string' || typeof rating !== 'number' || rating < 1 || rating > 5) {
                console.warn(`Skipping invalid song rating entry for user ${userId}:`, newSongRating);
                return;
            }

            const existingSongIndex = user.songs.findIndex(song => song.name === name);

            if (existingSongIndex !== -1) {
                user.songs[existingSongIndex].rating = rating;
            } else {
                user.songs.push({
                    name: name,
                    genre: genre,
                    rating: rating,
                    addedOn: new Date()
                });
            }
        }); 

        await user.save();

        return res.status(200).send({ message: 'Song ratings added/updated successfully.' });
	} catch(dbErr) {
		console.log(err)
		return res.status(500).send({ error: 'Internal server error' })
	}
}