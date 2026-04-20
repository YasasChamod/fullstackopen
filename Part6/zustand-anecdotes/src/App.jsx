
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import AnecdoteForm from './components/AnecdoteForm'
import AnecdoteList from './components/AnecdoteList'
import Filter from './components/Filter'
import Notification from './components/Notification'
import { getAnecdotes } from './requests'
import { useAnecdoteActions } from './store'

const App = () => {
  const { setAnecdotes } = useAnecdoteActions()

  const result = useQuery({
    queryKey: ['anecdotes'],
    queryFn: getAnecdotes,
    retry: false,
  })

  useEffect(() => {
    if (result.data) {
      setAnecdotes(result.data)
    }
  }, [result.data, setAnecdotes])

  if (result.isPending) {
    return <div>loading data...</div>
  }

  if (result.isError) {
    return <div>anecdote service not available due to problems in server</div>
  }

  return (
    <div>
      <h2>Anecdotes</h2>
      <Notification />
      <Filter />
      <AnecdoteList />
      <AnecdoteForm />
    </div>
  )
}

export default App