const { test, before, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
const { MONGODB_URI } = require('../utils/config')

const api = supertest(app)

const loginAndGetToken = async (username, password) => {
  const response = await api
    .post('/api/login')
    .send({ username, password })
    .expect(200)

  return response.body.token
}

before(async () => {
  await mongoose.connect(MONGODB_URI, { family: 4 })
})

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)

  const user = await new User({
    username: 'root',
    name: 'Superuser',
    passwordHash,
  }).save()

  const blogs = await Promise.all(
    helper.initialBlogs.map((blog) => new Blog({ ...blog, user: user._id }).save())
  )

  user.blogs = blogs.map((blog) => blog._id)
  await user.save()
})

test('blogs are returned as json with correct amount', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('unique identifier property is named id', async () => {
  const response = await api.get('/api/blogs')
  const blog = response.body[0]

  assert.ok(blog.id)
  assert.strictEqual(blog._id, undefined)
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Async testing with SuperTest',
    author: 'Node Tester',
    url: 'https://example.com/supertest',
    likes: 10,
  }

  const token = await loginAndGetToken('root', 'sekret')

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()

  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
  assert.ok(blogsAtEnd.map((blog) => blog.title).includes(newBlog.title))
})

test('blogs include creator user information', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.ok(response.body[0].user)
  assert.strictEqual(response.body[0].user.username, 'root')
  assert.strictEqual(response.body[0].user.name, 'Superuser')
})

test('if likes property is missing, it defaults to 0', async () => {
  const newBlog = {
    title: 'Missing likes default test',
    author: 'Default Likes',
    url: 'https://example.com/default-likes',
  }

  const token = await loginAndGetToken('root', 'sekret')

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

test('a blog can be deleted', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]
  const token = await loginAndGetToken('root', 'sekret')

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()

  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
  assert.ok(!blogsAtEnd.map((blog) => blog.id).includes(blogToDelete.id))
})

test('deleting a blog fails with status 401 if token is missing', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(401)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('deleting a blog fails with status 403 if user is not the creator', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  const otherPasswordHash = await bcrypt.hash('sekret2', 10)
  await new User({
    username: 'otheruser',
    name: 'Other User',
    passwordHash: otherPasswordHash,
  }).save()

  const token = await loginAndGetToken('otheruser', 'sekret2')

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(403)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('a blog can be updated', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]
  const updatedBlog = {
    ...blogToUpdate,
    likes: blogToUpdate.likes + 1,
  }

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, updatedBlog.likes)

  const blogsAtEnd = await helper.blogsInDb()
  const savedBlog = blogsAtEnd.find((blog) => blog.id === blogToUpdate.id)

  assert.strictEqual(savedBlog.likes, updatedBlog.likes)
  assert.strictEqual(savedBlog.title, blogToUpdate.title)
  assert.strictEqual(savedBlog.url, blogToUpdate.url)
})

test('creation fails with status 400 if title is missing', async () => {
  const newBlog = {
    author: 'No Title',
    url: 'https://example.com/no-title',
    likes: 3,
  }

  const token = await loginAndGetToken('root', 'sekret')

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('creation fails with status 400 if url is missing', async () => {
  const newBlog = {
    title: 'No URL',
    author: 'No URL Author',
    likes: 3,
  }

  const token = await loginAndGetToken('root', 'sekret')

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('creation fails with status 401 if token is not provided', async () => {
  const newBlog = {
    title: 'Unauthorized blog',
    author: 'No Token',
    url: 'https://example.com/no-token',
    likes: 1,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

after(async () => {
  await mongoose.connection.close()
})
