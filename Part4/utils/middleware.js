const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  console.error(error.message)
  response.status(500).json({ error: 'internal server error' })
}

module.exports = {
  unknownEndpoint,
  errorHandler,
}
