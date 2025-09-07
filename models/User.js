const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

	username: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		minLength: 6,
		maxLength: 24
	},
	email: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		unique: true,
		minLength: 6,
		maxLength: 24
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minLength: 6
	},
	songs: [
		{
			name: {
				type: String,
				required: false
			},
			artist: {
				type: String,
				required: false
			},
			genre: {
				type: String,
				required: false
			},
			rating: {
				type: Number,
				required: false,
				min: 1,
				max: 5
			},
			addedOn: {
				type: Date,
				default: new Date()
			}
		}
	],
	highlights: [
		{
			name: {
				type: String,
				required: true
			},
			addedOn: {
				type: Date,
				default: new Date()
			}
		}
	],
	spotifyAccessToken: {
		type: String
	},
	spotifyRefreshToken: {
		type: String
	},
	spotifyAccessTokenExpiration: {
		type: Date
	}
})

const User = mongoose.model('User', userSchema)

module.exports = User