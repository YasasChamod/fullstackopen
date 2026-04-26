import { useNavigate } from 'react-router-dom'
import { useAnecdotes, useField } from '../hooks'

const CreateNew = () => {
  const content = useField('text')
  const author = useField('text')
  const info = useField('text')
  const { addAnecdote } = useAnecdotes()
  const navigate = useNavigate()
  const { reset: resetContent, ...contentInput } = content
  const { reset: resetAuthor, ...authorInput } = author
  const { reset: resetInfo, ...infoInput } = info

  const handleSubmit = async (e) => {
    e.preventDefault()
    await addAnecdote({ content: content.value, author: author.value, info: info.value, votes: 0 })
    navigate('/')
  }

  const handleReset = () => {
    resetContent()
    resetAuthor()
    resetInfo()
  }

  return (
    <div>
      <h2>create a new anecdote</h2>
      <form onSubmit={handleSubmit}>
        <div>
          content
          <input name='content' {...contentInput} />
        </div>
        <div>
          author
          <input name='author' {...authorInput} />
        </div>
        <div>
          url for more info
          <input name='info' {...infoInput} />
        </div>
        <button>create</button>
        <button type='button' onClick={handleReset}>reset</button>
      </form>
    </div>
  )
}

export default CreateNew
