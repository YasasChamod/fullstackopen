import { useAnecdoteActions } from '../store'
import { useNotify } from '../useNotify'

const AnecdoteForm = () => {
  const { create } = useAnecdoteActions()
  const { notify } = useNotify()

  const handleCreate = async (event) => {
    event.preventDefault()

    const anecdote = event.target.anecdote.value.trim()
    if (!anecdote) {
      return
    }

    const createdAnecdote = await create(anecdote, {
      onSuccess: (newAnecdote) => {
        notify(`you created '${newAnecdote.content}'`)
      },
      onError: (error) => {
        notify(error.message)
      },
    })

    if (!createdAnecdote) {
      return
    }

    event.target.anecdote.value = ''
  }

  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={handleCreate}>
        <div>
          <input name="anecdote" />
        </div>
        <button type="submit">create</button>
      </form>
    </div>
  )
}

export default AnecdoteForm
