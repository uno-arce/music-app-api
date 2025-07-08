const chai = require('chai')
const http = require('chai-http')
const dotenv = require('dotenv')
chai.use(http)
dotenv.config()

try {
	const { app, mongoose } = require('../index.js')
	const MONGODB_URI = process.env.MONGODB_URI

	describe('Test UserController', function() {
		this.timeout(60000)

		before(async function() {
			await mongoose.connection.close()

			await mongoose.connect(MONGODB_URI)

			await mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas in Mocha Test'))
		})

		after(async function() {
			await mongoose.connection.close()
		})

		describe('User Registration (POST /users)', function() {
			it('should create a new user succesfully', (done) => {
				chai.request(app)
				.post('/users/register')
				.type('json')
				.send({
					
				})
			})
		})
	}
} catch(err) {
	console.log('App cannot be found')
	console.log(err)
}