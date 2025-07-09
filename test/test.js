const chai = require('chai')
const http = require('chai-http')
const dotenv = require('dotenv')
const expect = chai.expect
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
					 username: '333333',
					 email: 'admin@gmail.com',
					 password: 'admin123'
				})
				.end((err, res) => {
					console.log(res.body.username)
					expect(res).to.have.status(201)
					expect(res.body.message).to.include('User registered successfully')
					done(err)
				})
			})
		})
	})
} catch(err) {
	console.log('App cannot be found')
	console.log(err)
}