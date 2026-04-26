import { useEffect } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import SingleBlog from './components/SingleBlog'
import Notification from './components/Notification'
import Users from './components/Users'
import UserDetails from './components/UserDetails'
import ErrorBoundary from './components/ErrorBoundary'
import PageNotFound from './components/PageNotFound'
import useField from './hooks/useField'
import useBlogStore from './stores/blogStore'
import useUserStore from './stores/userStore'
import useNotificationStore from './stores/notificationStore'

const App = () => {
  const navigate = useNavigate()
  const usernameField = useField('text')
  const passwordField = useField('password')

  const blogs = useBlogStore((state) => state.blogs)
  const initializeBlogs = useBlogStore((state) => state.initializeBlogs)
  const createBlog = useBlogStore((state) => state.createBlog)
  const likeBlog = useBlogStore((state) => state.likeBlog)
  const deleteBlog = useBlogStore((state) => state.removeBlog)

  const user = useUserStore((state) => state.user)
  const initializeUser = useUserStore((state) => state.initializeUser)
  const loginUser = useUserStore((state) => state.loginUser)
  const logoutUser = useUserStore((state) => state.logoutUser)

  const notificationMessage = useNotificationStore((state) => state.message)
  const notificationType = useNotificationStore((state) => state.type)
  const displayNotification = useNotificationStore((state) => state.showNotification)

  useEffect(() => {
    initializeBlogs()
  }, [initializeBlogs])

  useEffect(() => {
    initializeUser()
  }, [initializeUser])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      await loginUser({
        username: usernameField.value,
        password: passwordField.value,
      })

      usernameField.reset()
      passwordField.reset()
      navigate('/')
    } catch {
      displayNotification('wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    logoutUser()
    navigate('/')
  }

  const handleBlogCreate = async (blogObject) => {
    try {
      const newBlog = await createBlog(blogObject)

      displayNotification(`a new blog ${newBlog.title} by ${newBlog.author} added`, 'success')
      navigate('/')
      return true
    } catch {
      displayNotification('Failed to create blog', 'error')
      return false
    }
  }

  const handleLike = async (blogToLike) => {
    try {
      await likeBlog(blogToLike)
    } catch {
      displayNotification('Failed to like blog', 'error')
      throw new Error('like failed')
    }
  }

  const handleRemove = async (blogToRemove) => {
    const okToRemove = window.confirm(`Remove blog ${blogToRemove.title} by ${blogToRemove.author}`)
    if (!okToRemove) {
      return
    }

    try {
      await deleteBlog(blogToRemove)
      displayNotification(`Removed blog ${blogToRemove.title}`, 'success')
    } catch {
      displayNotification('Failed to remove blog', 'error')
      throw new Error('remove failed')
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
              {...usernameField.inputProps}
              name="Username"
              placeholder="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password-input">password</label>
            <input
              id="password-input"
              {...passwordField.inputProps}
              name="Password"
              placeholder="password"
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
          <Link to="/users">users</Link>
          {!user && <Link to="/login">login</Link>}
          {user && <Link to="/create">new blog</Link>}
          {user && (
            <button type="button" onClick={handleLogout} className="btn-logout">logout</button>
          )}
        </div>
      </div>
      <Notification message={notificationMessage} type={notificationType} />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={blogsView()} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserDetails />} />
          <Route path="/login" element={loginView()} />
          <Route path="/create" element={createBlogView()} />
          <Route path="/blogs/:id" element={<SingleBlog user={user} onLike={handleLike} onRemove={handleRemove} displayNotification={displayNotification} />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </ErrorBoundary>
    </div>
  )
}

export default App