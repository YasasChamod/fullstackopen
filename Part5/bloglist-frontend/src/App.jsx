import { useState, useEffect } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import SingleBlog from './components/SingleBlog'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'

const LOCAL_STORAGE_KEY = 'loggedBlogappUser'
const sortBlogsByLikes = (blogs) => [...blogs].sort((a, b) => b.likes - a.likes)

const App = () => {
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [notificationType, setNotificationType] = useState(null)

  const displayNotification = (message, type, duration = 5000) => {
    if (type === 'error') {
      setErrorMessage(message)
    } else {
      setSuccessMessage(message)
    }
    setNotificationType(type)

    setTimeout(() => {
      setErrorMessage(null)
      setSuccessMessage(null)
      setNotificationType(null)
    }, duration)
  }

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(sortBlogsByLikes(blogs))
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem(LOCAL_STORAGE_KEY)

    if (loggedUserJSON) {
      const loggedUser = JSON.parse(loggedUserJSON)
      setUser(loggedUser)
      blogService.setToken(loggedUser.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const loggedInUser = await loginService.login({
        username,
        password,
      })

      blogService.setToken(loggedInUser.token)
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loggedInUser))
      setUser(loggedInUser)
      setUsername('')
      setPassword('')
      setErrorMessage(null)
      navigate('/')
    } catch {
      displayNotification('wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY)
    blogService.setToken(null)
    setUser(null)
    setBlogs([])
    blogService.getAll().then(blogs =>
      setBlogs(sortBlogsByLikes(blogs))
    )
    navigate('/')
  }

  const handleBlogCreate = async (blogObject) => {
    try {
      const newBlog = await blogService.create(blogObject)

      setBlogs(prevBlogs => sortBlogsByLikes(prevBlogs.concat(newBlog)))
      displayNotification(`a new blog ${newBlog.title} by ${newBlog.author} added`, 'success')
      navigate('/')
      return true
    } catch {
      displayNotification('Failed to create blog', 'error')
      return false
    }
  }

  const handleLike = async (blogToLike) => {
    const updatedBlogData = {
      user: blogToLike.user?.id || blogToLike.user?._id || blogToLike.user,
      likes: blogToLike.likes + 1,
      author: blogToLike.author,
      title: blogToLike.title,
      url: blogToLike.url,
    }

    try {
      const updatedBlog = await blogService.update(blogToLike.id, updatedBlogData)
      const blogWithUser = {
        ...updatedBlog,
        user: typeof updatedBlog.user === 'object' ? updatedBlog.user : blogToLike.user,
      }

      setBlogs(prevBlogs =>
        sortBlogsByLikes(
          prevBlogs.map(blog =>
            blog.id === blogToLike.id ? blogWithUser : blog
          )
        )
      )
    } catch {
      displayNotification('Failed to like blog', 'error')
    }
  }

  const handleRemove = async (blogToRemove) => {
    const okToRemove = window.confirm(`Remove blog ${blogToRemove.title} by ${blogToRemove.author}`)
    if (!okToRemove) {
      return
    }

    try {
      await blogService.remove(blogToRemove.id)
      setBlogs(prevBlogs => prevBlogs.filter(blog => blog.id !== blogToRemove.id))
      displayNotification(`Removed blog ${blogToRemove.title}`, 'success')
    } catch {
      displayNotification('Failed to remove blog', 'error')
    }
  }

  const canCurrentUserRemoveBlog = (blog) => {
    const blogUser = blog.user
    const currentUserId = user.id || user._id

    if (!blogUser) {
      return false
    }

    if (typeof blogUser === 'object') {
      const blogUserId = blogUser.id || blogUser._id
      return blogUser.username === user.username || (blogUserId && blogUserId === currentUserId)
    }

    return currentUserId ? blogUser === currentUserId : false
  }

  const handleCancelBlogCreate = () => {
    navigate('/')
  }

  const notificationMessage = errorMessage || successMessage

  const loginView = () => {
    if (user) {
      return <Navigate replace to="/" />
    }

    return (
      <div>
        <h2>Log in to application</h2>
        <form onSubmit={handleLogin} className="form-container">
          <div className="form-group">
            <label htmlFor="username-input">username</label>
            <input
              id="username-input"
              type="text"
              value={username}
              name="Username"
              placeholder="username"
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password-input">password</label>
            <input
              id="password-input"
              type="password"
              value={password}
              name="Password"
              placeholder="password"
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  const createBlogView = () => {
    if (!user) {
      return <Navigate replace to="/login" />
    }

    return <BlogForm onCreate={handleBlogCreate} onCancel={handleCancelBlogCreate} />
  }

  const blogsView = () => (
    <div>
      <h2>blogs</h2>
      {blogs.map(blog =>
        <Blog
          key={blog.id}
          blog={blog}
          user={user}
          onLike={handleLike}
          onRemove={handleRemove}
          canRemove={user ? canCurrentUserRemoveBlog(blog) : false}
        />
      )}
    </div>
  )

  return (
    <div className="container">
      <div className="navbar">
        <div className="navbar-brand">Blog App</div>
        <div className="navbar-links">
          <Link to="/">blogs</Link>
          {!user && <Link to="/login">login</Link>}
          {user && <Link to="/create">new blog</Link>}
          {user && (
            <button type="button" onClick={handleLogout} className="btn-logout">logout</button>
          )}
        </div>
      </div>
      <Notification message={notificationMessage} type={notificationType} />
      <Routes>
        <Route path="/" element={blogsView()} />
        <Route path="/login" element={loginView()} />
        <Route path="/create" element={createBlogView()} />
        <Route path="/blogs/:id" element={<SingleBlog blogs={blogs} user={user} onLike={handleLike} onRemove={handleRemove} displayNotification={displayNotification} />} />
      </Routes>
    </div>
  )
}

export default App