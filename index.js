const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const userRoutes = require('./routes/userRoutes.js')
const spotifyRoutes = require('./routes/spotifyRoutes.js')

dotenv.config()
const app = express()
// Database Connection
const MONGODB_URI = process.env.MONGODB_URI

mongoose.connect(MONGODB_URI)
let db = mongoose.connection
db.once('open', () => console.log('Now connected to MongoDB Atlas'))


// Server Setup and Cors Configuration
const corsOptions = {
	origin: process.env.CLIENT_URL,
	credentials: true,
	optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

app.use(express.static(__dirname + '/public'))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))


// Middleware
app.use('/users', userRoutes)
app.use('/auth/spotify', spotifyRoutes)


const PORT = process.env.PORT || 4000
if(require.main === module) {
	app.listen(PORT, () => console.log(`API is now online on port ${PORT}`))
}

module.exports = app