const chai = require('chai')
const http = require('chai-http')
const nock = require('nock')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')
const expect = chai.expect
chai.use(http)
dotenv.config()

// URL's for Nock
const spotify_token_api_base = 'https://accounts.spotify.com'
const spotify_token_api_path = '/api/token'
const spotify_me_api_base = 'https://api.spotify.com'
const spotify_me_api_path = '/v1/me'
const test_server_url = 'http://localhost:4000'
const redirect_uri = process.env.REDIRECT_URI

try {
	const { app, mongoose } = require('../index.js')
	const auth = require('../auth.js')
	const User = require('../models/User')
	const MONGODB_URI = process.env.MONGODB_URI

	describe('Test Spotify Authorization Code Flow', function() {
		this.timeout(60000)

		before(async function() {
			await mongoose.connection.close()

			await mongoose.connect(MONGODB_URI)

			await mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas in Mocha Test'))
		})

		after(async function() {
			await mongoose.connection.close()
		})

		describe('User Authorization Spotify (GET /auth/spotify', function() {
			it('should authorize the app successfully', async () => {
				const res = await chai.request(app)
				.get('/auth/spotify/')
				.redirects(0)
				.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzBhYjZlYjUwZGI0OTEzNzg0ZWEyOSIsImVtYWlsIjoidW5vQGdtYWlsLmNvbSIsImlhdCI6MTc1Mjc0NTY4NH0.8-sGI0cb_yCkZM6ScvBOziS9ve1Zxy5EsrDTbB7H7DY')

				expect(res).to.have.status(302)
				expect(res).to.have.header('location')
				expect(res.header.location).to.include('https://accounts.spotify.com/authorize')
				expect(res.header.location).to.include(`client_id=${process.env.CLIENT_ID}`)
				expect(res.header.location).to.include(`redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}`)
				expect(res.header.location).to.include('response_type=code')
				expect(res.header.location).to.include('scope=user-read-private%20user-read-email')

				// Check for the state cookie
                expect(res).to.have.cookie('spotify_auth_state');
                const stateCookie = res.header['set-cookie'].find(cookie => cookie.startsWith('spotify_auth_state='));
                expect(stateCookie).to.exist;

                // Extract the state from the cookie and from the redirect URL
                const stateFromCookie = stateCookie.split(';')[0].split('=')[1];
                expect(res.header.location).to.include(`state=${stateFromCookie}`);
			})

			it('should provide access to user playlist', async () => {
				const res = await chai.request(app)
				.get('/auth/spotify/')
				.redirects(0)
				.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzBhYjZlYjUwZGI0OTEzNzg0ZWEyOSIsImVtYWlsIjoidW5vQGdtYWlsLmNvbSIsImlhdCI6MTc1Mjc0NTY4NH0.8-sGI0cb_yCkZM6ScvBOziS9ve1Zxy5EsrDTbB7H7DY')

				expect(res.header.location).to.include(encodeURIComponent('playlist-read-private'))
				expect(res.header.location).to.include(encodeURIComponent('playlist-read-collaborative'))
			})

			it('should provide access to user recently played songs', async () => {
				const res = await chai.request(app)
				.get('/auth/spotify/')
				.redirects(0)
				.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzBhYjZlYjUwZGI0OTEzNzg0ZWEyOSIsImVtYWlsIjoidW5vQGdtYWlsLmNvbSIsImlhdCI6MTc1Mjc0NTY4NH0.8-sGI0cb_yCkZM6ScvBOziS9ve1Zxy5EsrDTbB7H7DY')

				expect(res.header.location).to.include(encodeURIComponent('user-read-recently-played'))
			})

			it('should provide access to user top songs and artists', async () => {
				const res = await chai.request(app)
				.get('/auth/spotify/')
				.redirects(0)
				.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzBhYjZlYjUwZGI0OTEzNzg0ZWEyOSIsImVtYWlsIjoidW5vQGdtYWlsLmNvbSIsImlhdCI6MTc1Mjc0NTY4NH0.8-sGI0cb_yCkZM6ScvBOziS9ve1Zxy5EsrDTbB7H7DY')

				expect(res.header.location).to.include(encodeURIComponent('user-top-read'))
			})

			it('should provide access to user library', async () => {
				const res = await chai.request(app)
				.get('/auth/spotify/')
				.redirects(0)
				.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzBhYjZlYjUwZGI0OTEzNzg0ZWEyOSIsImVtYWlsIjoidW5vQGdtYWlsLmNvbSIsImlhdCI6MTc1Mjc0NTY4NH0.8-sGI0cb_yCkZM6ScvBOziS9ve1Zxy5EsrDTbB7H7DY')

				expect(res.header.location).to.include(encodeURIComponent('user-library-read'))
			})
		})

		describe('App Request Access Token Spotify (GET /auth/spotify/callback', function() {
			let testUser

			beforeEach(async function() {
				testUser = await User.findOne({email: 'uno@gmail.com'})

				nock.cleanAll()
			})

			afterEach(async function() {
				await User.findOneAndUpdate({_id: testUser._id},
					{
						$set: {
							spotifyAccessToken: null,
							spotifyRefreshToken: null,
							spotifyAccessTokenExpiration: null
						}
					}
				)

				nock.isDone()
			})

			it('should exchange code for access tokens and update user in DB', async() => {
				const verifiedUserJwt = auth.createAccessToken(testUser)
				const mockCode = 'mock_auth_code'
				const mockState = 'mock_state_from_cookie'

				// Mock Spotify Token Exchange
				nock(spotify_token_api_base)
				.post(spotify_token_api_path)
				.query(true)
				.reply(200, {
					access_token: 'mock_access_token',
					refresh_token: 'mock_refresh_token',
					expires_in: 3600
				})

				// Mock Spotify Get User Profile
				nock(spotify_me_api_base)
				.get(spotify_me_api_path)
				.query(true)
				.reply(200, {
					id: 'mock_spotify_user_id',
					display_name: 'Mock Spotify User'
				})

				// Simulate cookie being set by the /auth/spotify route
				const agent = chai.request.agent(app)
				agent.jar.setCookie(`spotify_auth_state=${mockState}`, test_server_url)

				const res = await agent
				.get('/auth/spotify/callback')
				.query({ code: mockCode, state: mockState})
				.set('Authorization', `Bearer ${verifiedUserJwt}`)

				expect(res).to.have.status(302);
                expect(res).to.have.header('location');
                expect(res.header.location).to.include('/#')
                expect(res.header.location).to.include('access_token=mock_access_token')
                expect(res.header.location).to.include('refresh_token=mock_refresh_token')
                expect(res.header.location).to.include('message=Spotify linked successfully')

                // Verify if User was updated
                const updatedUser = await User.findById(testUser._id)
                expect(updatedUser.spotifyAccessToken).to.equal('mock_access_token')
                expect(updatedUser.spotifyRefreshToken).to.equal('mock_refresh_token')
                expect(updatedUser.spotifyAccessTokenExpiration).to.be.a('date')
                console.error
			} )
		})
	})

} catch(err) {
	console.log('App cannot be found')
	console.log(err)
}