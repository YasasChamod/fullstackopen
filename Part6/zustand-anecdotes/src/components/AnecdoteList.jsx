import React from 'react'
import { useAnecdotes, useAnecdoteActions, useFilter } from '../store'
import { useNotify } from '../useNotify'

const AnecdoteList = () => {
  const anecdotes = useAnecdotes()
  const filter = useFilter()
  const { vote, remove } = useAnecdoteActions()
  const { notify } = useNotify()
  const filteredAnecdotes = anecdotes.filter((anecdote) =>
    anecdote.content.toLowerCase().includes(filter.toLowerCase())
  )
  const sortedAnecdotes = filteredAnecdotes.toSorted((a, b) => b.votes - a.votes)

  const handleVote = async (id) => {
    const votedAnecdote = await vote(id)
    if (!votedAnecdote) {
      return
    }

    notify(`you voted '${votedAnecdote.content}'`)
  }

  return sortedAnecdotes.map((anecdote) => (
    <div key={anecdote.id}>
      <div>{anecdote.content}</div>
      <div>
        has {anecdote.votes}
        <button onClick={() => handleVote(anecdote.id)}>vote</button>
        {anecdote.votes === 0 && (
          <button onClick={() => remove(anecdote.id)}>delete</button>
        )}
      </div>
    </div>
  ))
}

export default AnecdoteList
