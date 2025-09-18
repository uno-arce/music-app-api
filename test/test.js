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
			it('should return 200 and message if user registration successful', async () => {
				const res = await chai.request(app)
				.post('/users/register')
				.type('json')
				.send({
					 username: 'user.one',
					 email: 'userone@gmail.com',
					 password: 'admin@123'
				})
				
				expect(res).to.have.status(201)
				expect(res.body.message).to.include('User registered successfully')
				await mongoose.model('User').deleteOne({ _id: res.body._id })
			})

			it('should return 400 and error if username is composed of only numbers', (done) => {
				chai.request(app)
				.post('/users/register')
				.type('json')
				.send({
					username: '@/`~$%^&',
					email: 'admin@gmail.com',
					password: 'admin123'
				})
				.end((err, res) => {
					expect(res).to.have.status(400)
					expect(res.body.error).to.include('Invalid username')
					done(err)
				})
			})

			it('should return 400 and error if username is composed of only symbols', (done) => {
				chai.request(app)
				.post('/users/register')
				.type('json')
				.send({
					username: '333333',
					email: 'admin@gmail.com',
					password: 'admin123'
				})
				.end((err, res) => {
					expect(res).to.have.status(400)
					expect(res.body.error).to.include('Invalid username')
					done(err)	
				})
			})

			it('should return 400 and error if email is does not have @ symbol and .com', (done) => {
				chai.request(app)
				.post('/users/register')
				.type('json')
				.send({
					username: 'user.one',
					email: 'admingmail.com',
					password: 'admin123'
				})
				.end((err, res) => {
					expect(res).to.have.status(400)
					expect(res.body.error).to.include('Invalid email')
					done(err)
				})
			})

			it('should return 409 and error if email is already taken', (done) => {
				chai.request(app)
				.post('/users/register')
				.type('json')
				.send({
					username: 'user.one',
					email: 'uno@gmail.com',
					password: 'admin123'
				})
				.end((err, res) => {
					expect(res).to.have.status(409)
					expect(res.body.error).to.include('Email was already taken')
					done(err)	
				})
			})

			it('should return 400 and error if password does not contain one symbol and number', (done) => {
				chai.request(app)
				.post('/users/register')
				.type('json')
				.send({
					username: 'user.one',
					email: 'admin@gmail.com',
					password: 'admin@'
				})
				.end((err, res) => {
					expect(res).to.have.status(400)
					expect(res.body.error).to.include('Password must contain atleast one symbol and number')
					done(err)
				})
			})

			it('should return 400 and error if password is not atleast 6 characters', (done) => {
				chai.request(app)
				.post('/users/register')
				.type('json')
				.send({
					username: 'user.one',
					email: 'admin@gmail.com',
					password: '@dm1n'
				})
				.end((err, res) => {
					expect(res).to.have.status(400)
					expect(res.body.error).to.include('Password must be atleast 6 characters')
					done(err)
				})
			})

		})


		describe('User Login (POST /users)', function() {
			it('should return 200 and message if user login successfully', async () => {
				const res = await chai.request(app)
				.post('/users/login')
				.type('json')
				.send({
					email: 'uno@gmail.com',
					password: 'admin@123'
				})
				
				expect(res).to.have.status(200)
				expect(res.body.message).to.include('User login successfully')
			})

			it('should return 400 and error if user is not registered', async () => {
				const res = await chai.request(app)
				.post('/users/login')
				.type('json')
				.send({
					email: 'user@gmail.com',
					password: 'admin@123'
				})
				
				expect(res).to.have.status(400)
				expect(res.body.error).to.include('Incorrect email or password')
			})

			it('should return 400 and error if user email has incorrect format', async () => {
				const res = await chai.request(app)
				.post('/users/login')
				.type('json')
				.send({
					email: 'usergmail.com',
					password: 'admin@123'
				})
				
				expect(res).to.have.status(400)
				expect(res.body.error).to.include('Invalid email format: Please provide a valid email address (e.g., user@example.com)')
			})

			it('should return 400 and error if user password is incorrect', async () => {
				const res = await chai.request(app)
				.post('/users/login')
				.type('json')
				.send({
					email: 'uno@gmail.com',
					password: 'admin@1'
				})

				expect(res).to.have.status(400)
				expect(res.body.error).to.include('Incorrect email or password')
			})
		})

		describe('User Verification (POST /users)', function() {
			it('should return 200 if user has authentication', async() => {
				const res = await chai.request(app)
				.post('/users/login')
				.type('json')
				.send({
					email: 'uno@gmail.com',
					password: 'admin@123'
				})

				expect(res).to.have.status(200)
			})
		})

		describe('User Logout (POST /users', function() {
			it('should return 200 and message if user logout successfully', async() => {
				const res = await chai.request(app)
				.post('/users/logout')

				expect(res).to.have.status(200)
				expect(res.body.message).to.include('User logged off successfully')
			})

			it('should return token undefined if user logout successfully', async() => {
				const res = await chai.request(app)
				.post('/users/logout')

				expect(res.body.authToken).to.be.undefined
			})
		})

		describe('User Check Email Availability (POST /users', function() {
			it('should return 200 and message if email is available', async() => {
				const res = await chai.request(app)
				.post('/users/check-email-availability')
				.type('json')
				.send({
					email: 'unoarce@gmail.com'
				})
				.set('Cookie', 'authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzBhYjZlYjUwZGI0OTEzNzg0ZWEyOSIsImVtYWlsIjoidW5vQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoidW5vLmFyY2UiLCJpYXQiOjE3NTgyMDYxNzN9.T4wyyb-ajb4gnLL_zujVP9n1_f76pm2vxvcr_4hpktM')

				expect(res).to.have.status(200)
				expect(res.body.message).to.include('Email is available')
			})

			it('should return 400 and error if email is not available', async() => {
				const res = await chai.request(app)
				.post('/users/check-email-availability')
				.type('json')
				.send({
					email: 'uno@gmail.com'
				})
				.set('Cookie', 'authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzBhYjZlYjUwZGI0OTEzNzg0ZWEyOSIsImVtYWlsIjoidW5vQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoidW5vLmFyY2UiLCJpYXQiOjE3NTgyMDYxNzN9.T4wyyb-ajb4gnLL_zujVP9n1_f76pm2vxvcr_4hpktM')

				expect(res).to.have.status(400)
				expect(res.body.error).to.include('Email was already taken')
			})
		})

		describe('User Add Rating (PUT /users', function() {
			it('should add rated song if new or does not exist', async() => {
				const res = await chai.request(app)
				.put('/users/rate-song')
				.type('json')
				.send({
					ratedSong: {
						name: '300 Dreams',
						artist: 'After',
						rating: 3,
					}
				})
				.set('Cookie', 'authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzBhYjZlYjUwZGI0OTEzNzg0ZWEyOSIsImVtYWlsIjoidW5vQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoidW5vLmFyY2UiLCJpYXQiOjE3NTgyMDYxNzN9.T4wyyb-ajb4gnLL_zujVP9n1_f76pm2vxvcr_4hpktM')

				expect(res).to.have.status(200)
				expect(res.body.message).to.include('Song rating added/updated successfully')
			})
		})

	})
} catch(err) {
	console.log('App cannot be found')
	console.log(err)
}