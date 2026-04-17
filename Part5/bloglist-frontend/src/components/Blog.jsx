import { useState } from 'react'
import { Link } from 'react-router-dom'

const Blog = ({ blog, onLike, onRemove, canRemove, user }) => {
  const [detailsVisible, setDetailsVisible] = useState(false)

  return (
    <div className="blog">
      <div className="blog-summary">
        <Link to={`/blogs/${blog.id}`} style={{ marginRight: 10 }}>
          {blog.title} {blog.author}
        </Link>
        <button type="button" onClick={() => setDetailsVisible(!detailsVisible)} className="btn-view">
          {detailsVisible ? 'hide' : 'view'}
        </button>
      </div>

      {detailsVisible && (
        <div className="blog-details">
          <div>{blog.url}</div>
          <div>
            likes {blog.likes}
            {user && (
              <button type="button" onClick={() => onLike(blog)} className="btn-like">like</button>
            )}
          </div>
          <div>{blog.user?.name}</div>
          {canRemove && (
            <button type="button" onClick={() => onRemove(blog)} className="btn-remove">remove</button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog