import { useState } from 'react'

const BlogForm = ({ onCreate, onCancel }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    const created = await onCreate({ title, author, url })
    if (created) {
      setTitle('')
      setAuthor('')
      setUrl('')
    }
  }

  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="title-input">title:</label>
          <input
            id="title-input"
            type="text"
            value={title}
            name="Title"
            placeholder="title"
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="author-input">author:</label>
          <input
            id="author-input"
            type="text"
            value={author}
            name="Author"
            placeholder="author"
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="url-input">url:</label>
          <input
            id="url-input"
            type="text"
            value={url}
            name="Url"
            placeholder="url"
            onChange={({ target }) => setUrl(target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit">create</button>
          <button type="button" onClick={onCancel} className="btn-secondary">cancel</button>
        </div>
      </form>
    </div>
  )
}

export default BlogForm