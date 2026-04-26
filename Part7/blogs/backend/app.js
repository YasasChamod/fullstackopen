const express = require('express')
const path = require('path')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')

const app = express()

app.use(express.json())
app.use(middleware.tokenExtractor)
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'production') {
	const frontendDistPath = path.join(__dirname, '../frontend/dist')
	app.use(express.static(frontendDistPath))

	app.get(/^\/(?!api).*/, (request, response) => {
		response.sendFile(path.join(frontendDistPath, 'index.html'))
	})
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
