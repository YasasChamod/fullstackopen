const mongoose = require('mongoose')
const app = require('./app')
const { MONGODB_URI, PORT } = require('./utils/config')

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables')
  process.exit(1)
}

mongoose
  .connect(MONGODB_URI, { family: 4 })
  .then(() => {
    console.log('connected to MongoDB')
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('error connecting to MongoDB:', error.message)
    process.exit(1)
  })
