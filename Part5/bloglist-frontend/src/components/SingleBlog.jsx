import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import blogService from '../services/blogs'

const SingleBlog = ({ blogs, user, onLike, onRemove, displayNotification }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const foundBlog = blogs.find(b => b.id === id)
    if (foundBlog) {
      setBlog(foundBlog)
      setLoading(false)
    } else {
      // If blog not in state, fetch it
      blogService.getAll().then(allBlogs => {
        const foundBlog = allBlogs.find(b => b.id === id)
        if (foundBlog) {
          setBlog(foundBlog)
        }
        setLoading(false)
      })
    }
  }, [id, blogs])

  const canRemoveBlog = () => {
    if (!user || !blog) return false
    const blogUser = blog.user
    const currentUserId = user.id || user._id

    if (!blogUser) return false

    if (typeof blogUser === 'object') {
      const blogUserId = blogUser.id || blogUser._id
      return blogUser.username === user.username || (blogUserId && blogUserId === currentUserId)
    }

    return currentUserId ? blogUser === currentUserId : false
  }

  const handleLike = async () => {
    if (!user) {
      displayNotification('You must be logged in to like a blog', 'error')
      return
    }

    const updatedBlogData = {
      user: blog.user?.id || blog.user?._id || blog.user,
      likes: blog.likes + 1,
      author: blog.author,
      title: blog.title,
      url: blog.url,
    }

    try {
      const updatedBlog = await blogService.update(blog.id, updatedBlogData)
      const blogWithUser = {
        ...updatedBlog,
        user: typeof updatedBlog.user === 'object' ? updatedBlog.user : blog.user,
      }
      setBlog(blogWithUser)
      onLike(blogWithUser)
      displayNotification(`Liked blog ${blog.title}`, 'success')
    } catch {
      displayNotification('Failed to like blog', 'error')
    }
  }

  const handleRemove = async () => {
    const okToRemove = window.confirm(`Remove blog ${blog.title} by ${blog.author}`)
    if (!okToRemove) {
      return
    }

    try {
      await blogService.remove(blog.id)
      displayNotification(`Removed blog ${blog.title}`, 'success')
      onRemove(blog)
      navigate('/')
    } catch {
      displayNotification('Failed to remove blog', 'error')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!blog) {
    return <div>Blog not found</div>
  }

  return (
    <div className="single-blog">
      <h2>{blog.title}</h2>
      <div className="single-blog-meta">by {blog.author}</div>
      <div className="single-blog-url">
        <a href={blog.url} target="_blank" rel="noopener noreferrer">{blog.url}</a>
      </div>
      <div className="single-blog-meta">Added by {blog.user?.name}</div>
      <div className="single-blog-actions">
        <span>{blog.likes} likes</span>
        {user && (
          <button type="button" onClick={handleLike} className="btn-like">like</button>
        )}
        {canRemoveBlog() && (
          <button type="button" onClick={handleRemove} className="btn-remove">remove</button>
        )}
      </div>
    </div>
  )
}

export default SingleBlog
