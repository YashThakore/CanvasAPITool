const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

// Routes
const userRoutes = require('./routes/user')
app.use('/api/user', userRoutes)

const fetchProfile = require('./routes/fetchProfile')
app.use('/api/fetch-profile', fetchProfile)

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected')
  app.listen(5000, () => console.log('Server running on port 5000'))
})
.catch(err => console.error('MongoDB connection error:', err))
