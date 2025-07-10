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
			ofTheDay: [
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
			addedOn: {
				type: Date,
				default: new Date()
			}
		}
	]	
})

const User = mongoose.model('User', userSchema)

module.exports = User