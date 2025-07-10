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
			it('should return 200 and message if user registration successful', (done) => {
				chai.request(app)
				.post('/users/register')
				.type('json')
				.send({
					 username: 'user.one',
					 email: 'userone@gmail.com',
					 password: 'admin@123'
				})
				.end(async (err, res) => {
					try {
						expect(res).to.have.status(201)
						expect(res.body.message).to.include('User registered successfully')
						await mongoose.model('User').deleteOne({ _id: res.body._id })
						done(err)
					} catch(err) {
						done(err)
					}
				})
			})

			it('should return 400 and error if username is composed of only numbers', function() {
				chai.request(app)
				.post('/users/register')
				.type('json')
				.send({
					username: '@/`~$%^&',
					email: 'admin@gmail.com',
					password: 'admin123'
				})
				.end(async (err, res) => {
					try {
						expect(res).to.have.status(400)
						expect(res.body.error).to.include('Invalid username')
						done(err)
					} catch(err) {
						done(err)
					}
				})
			})

			it('should return 400 and error if username is composed of only symbols', function() {
				chai.request(app)
				.post('/users/register')
				.type('json')
				.send({
					username: '333333',
					email: 'admin@gmail.com',
					password: 'admin123'
				})
				.end(async (err, res) => {
					try {
						expect(res).to.have.status(400)
						expect(res.body.error).to.include('Invalid username')
						done(err)
					} catch(err) {
						done(err)
					}	
				})
			})

			it('should return 400 and error if email is does not have @ symbol and .com', function() {
				chai.request(app)
				.post('/users/register')
				.type('json')
				.send({
					username: 'user.one',
					email: 'admingmail.com',
					password: 'admin123'
				})
				.end(async (err, res) => {
					try {
						expect(res).to.have.status(400)
						expect(res.body.error).to.include('Invalid email')
						done(err)
					} catch(err) {
						done(err)
					}	
				})
			})

			it('should return 409 and error if email is already taken', function() {
				chai.request(app)
				.post('/users/register')
				.type('json')
				.send({
					username: 'user.one',
					email: 'uno@gmail.com',
					password: 'admin123'
				})
				.end(async (err, res) => {
					try {
						expect(res).to.have.status(409)
						expect(res.body.error).to.include('Email was already taken')
						done(err)
					} catch(err) {
						done(err)
					}	
				})
			})

			it('should return 400 and error if password does not contain one symbol and number', function() {
				chai.request(app)
				.post('/users/register')
				.type('json')
				.send({
					username: 'user.one',
					email: 'admin@gmail.com',
					password: 'admin@'
				})
				.end(async (err, res) => {
					try {
						expect(res).to.have.status(400)
						expect(res.body.error).to.include('Password must contain atleas one symbol and number')
						done(err)
					} catch(err) {
						done(err)
					}	
				})
			})

		})


		describe('User Login (POST /users)', function() {
			it('should return 200 and message if user login successfully', function() {
				chai.request(app)
				.post('/users/login')
				.type('json')
				.send({
					username: 'uno.arce',
					password: 'admin123'
				})
				.end((err, res) => {
					expect(res).to.have.status(200)
					expect(res.body).to.include('User login successfully')
					done(err)
				})
			})

		})
	})
} catch(err) {
	console.log('App cannot be found')
	console.log(err)
}