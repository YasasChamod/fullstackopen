import { useNavigate, useParams } from 'react-router-dom'
import useBlogStore from '../stores/blogStore'
import useField from '../hooks/useField'

const SingleBlog = ({ user, onLike, onRemove, displayNotification }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const commentField = useField('text')
  const blogs = useBlogStore((state) => state.blogs)
  const addComment = useBlogStore((state) => state.addComment)
  const blog = blogs.find((existingBlog) => existingBlog.id === id)

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

    try {
      await onLike(blog)
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
      displayNotification(`Removed blog ${blog.title}`, 'success')
      onRemove(blog)
      navigate('/')
    } catch {
      displayNotification('Failed to remove blog', 'error')
    }
  }

  if (!blog) {
    return <div>Blog not found</div>
  }

  const handleCommentSubmit = async (event) => {
    event.preventDefault()

    try {
      await addComment(blog.id, commentField.value)
      commentField.reset()
      displayNotification('Comment added', 'success')
    } catch {
      displayNotification('Failed to add comment', 'error')
    }
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

      <div className="comments-section">
        <h3>comments</h3>
        <form onSubmit={handleCommentSubmit} className="comments-form">
          <input
            {...commentField.inputProps}
            placeholder="write a comment"
            name="Comment"
          />
          <button type="submit">add comment</button>
        </form>

        <ul>
          {(blog.comments || []).map((comment, index) => (
            <li key={`${comment}-${index}`}>{comment}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default SingleBlog
