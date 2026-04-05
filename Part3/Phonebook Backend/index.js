const express = require('express')
const cors = require('cors') // <-- ADD THIS HERE
const morgan = require('morgan')
const app = express()

// --- MIDDLEWARE ---
app.use(express.static('dist'))
app.use(cors()) 
app.use(express.json())

morgan.token('body', (req) => req.method === 'POST' ? JSON.stringify(req.body) : '')
app.use(morgan('tiny :body'))


// --- DATA ---
const persons = [
  {
    "id": "1",
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": "2",
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": "3",
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": "4",
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

// --- ROUTES ---
app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(p => p.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const index = persons.findIndex(p => p.id === id)
  if (index !== -1) {
    persons.splice(index, 1)
    response.status(204).end()
  } else {
    response.status(404).end()
  }
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number is missing' })
  }

  const nameExists = persons.some(p => p.name === body.name)
  if (nameExists) {
    return response.status(400).json({ error: 'name must be unique' })
  }

  const newPerson = {
    id: Math.floor(Math.random() * 1000000).toString(),
    name: body.name,
    number: body.number
  }

  persons.push(newPerson)
  response.json(newPerson)
})

app.get('/info', (request, response) => {
  const entryCount = persons.length
  const now = new Date()
  response.send(
    `<p>Phonebook has info for ${entryCount} people</p><p>${now}</p>`
  )
})

// --- SERVER SETUP ---
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})