const { test, before, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const { MONGODB_URI } = require('../utils/config')

const api = supertest(app)

before(async () => {
  await mongoose.connect(MONGODB_URI, { family: 4 })
})

beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})

  const user = await new User({
    username: 'root',
    name: 'Superuser',
    passwordHash: 'not-a-real-hash',
  }).save()

  const blog = await new Blog({
    title: 'Root user blog',
    author: 'Root Author',
    url: 'https://example.com/root-blog',
    likes: 1,
    user: user._id,
  }).save()

  user.blogs = [blog._id]
  await user.save()
})

test('creation succeeds with a fresh username', async () => {
  const usersAtStart = await helper.usersInDb()

  const newUser = {
    username: 'mluukkai',
    name: 'Matti Luukkainen',
    password: 'salainen',
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const usersAtEnd = await helper.usersInDb()

  assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
  assert.ok(usersAtEnd.map((u) => u.username).includes(newUser.username))
})

test('creation fails with proper statuscode and message if username already exists', async () => {
  const usersAtStart = await helper.usersInDb()

  const newUser = {
    username: 'root',
    name: 'Another Root',
    password: 'salainen',
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  assert.match(result.body.error, /username must be unique/i)

  const usersAtEnd = await helper.usersInDb()
  assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})

test('creation fails if username is missing', async () => {
  const usersAtStart = await helper.usersInDb()

  const newUser = {
    name: 'No Username',
    password: 'salainen',
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  assert.match(result.body.error, /username must be at least 3 characters long/i)

  const usersAtEnd = await helper.usersInDb()
  assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})

test('creation fails if username is shorter than 3 characters', async () => {
  const usersAtStart = await helper.usersInDb()

  const newUser = {
    username: 'ab',
    name: 'Short Username',
    password: 'salainen',
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  assert.match(result.body.error, /username must be at least 3 characters long/i)

  const usersAtEnd = await helper.usersInDb()
  assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})

test('creation fails if password is missing', async () => {
  const usersAtStart = await helper.usersInDb()

  const newUser = {
    username: 'newuser',
    name: 'No Password',
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  assert.match(result.body.error, /password must be at least 3 characters long/i)

  const usersAtEnd = await helper.usersInDb()
  assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})

test('creation fails if password is shorter than 3 characters', async () => {
  const usersAtStart = await helper.usersInDb()

  const newUser = {
    username: 'newuser',
    name: 'Short Password',
    password: 'ab',
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  assert.match(result.body.error, /password must be at least 3 characters long/i)

  const usersAtEnd = await helper.usersInDb()
  assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})

test('all users can be listed', async () => {
  const response = await api
    .get('/api/users')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.length, 1)
  assert.strictEqual(response.body[0].username, 'root')
  assert.strictEqual(response.body[0].passwordHash, undefined)
  assert.ok(Array.isArray(response.body[0].blogs))
  assert.strictEqual(response.body[0].blogs.length, 1)
  assert.strictEqual(response.body[0].blogs[0].title, 'Root user blog')
})

after(async () => {
  await mongoose.connection.close()
})
