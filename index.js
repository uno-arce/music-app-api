const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const userRoutes = require('./routes/userRoutes.js')

// Database Connection
dotenv.config()
const MONGODB_URI = process.env.MONGODB_URI

mongoose.connect(MONGODB_URI)
mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas'))


// Server Setup and Cors Configuration
const app = express()

const corsOptions = {
	origin: ['http://localhost:3000'],
	optionSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({extended:true}))


// Middleware
app.use('/users', userRoutes)


const PORT = process.env.PORT || 4000
if(require.main === module) {
	app.listen(PORT, () => console.log(`API is now online on port ${PORT}`))
}

module.exports = {app, mongoose}