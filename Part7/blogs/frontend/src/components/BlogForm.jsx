import useField from '../hooks/useField'

const BlogForm = ({ onCreate, onCancel }) => {
  const titleField = useField('text')
  const authorField = useField('text')
  const urlField = useField('text')

  const handleSubmit = async (event) => {
    event.preventDefault()

    const created = await onCreate({
      title: titleField.value,
      author: authorField.value,
      url: urlField.value,
    })
    if (created) {
      titleField.reset()
      authorField.reset()
      urlField.reset()
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
            {...titleField.inputProps}
            name="Title"
            placeholder="title"
          />
        </div>
        <div className="form-group">
          <label htmlFor="author-input">author:</label>
          <input
            id="author-input"
            {...authorField.inputProps}
            name="Author"
            placeholder="author"
          />
        </div>
        <div className="form-group">
          <label htmlFor="url-input">url:</label>
          <input
            id="url-input"
            {...urlField.inputProps}
            name="Url"
            placeholder="url"
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