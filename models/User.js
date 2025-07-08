const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

	username: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		minlength: 6,
		maxlength: 24
	},
	email: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		minlength: 6,
		maxlength: 24
	},
	password: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		minlength: 6,
		maxlength: 24
	},
	songs: [
		{
			name: {
				type: String,
				required: false,
			},
			genre: {
				type: String,
				required: false
			},
			rating: {
				type: Number,
				required: false,
				minlength: 1,
				maxlength: 5
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
					},
				}
			],
			addedOn: {
				type: Date,
				default: new Date()
			}
		}
	]	
})

const User = mongoose.model('Users', userSchema)

module.exports = User