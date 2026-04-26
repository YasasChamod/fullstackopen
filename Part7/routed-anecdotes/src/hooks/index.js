import { createContext, createElement, useContext, useEffect, useMemo, useState } from 'react'
import anecdoteService from '../services/anecdotes'

export const useField = (type) => {
  const [value, setValue] = useState('')

  const onChange = (event) => {
    setValue(event.target.value)
  }

  const reset = () => {
    setValue('')
  }

  return {
    type,
    value,
    onChange,
    reset
  }
}

const AnecdotesContext = createContext(null)

export const AnecdotesProvider = ({ children }) => {
  const [anecdotes, setAnecdotes] = useState([])

  useEffect(() => {
    anecdoteService.getAll().then(data => setAnecdotes(data))
  }, [])

  const addAnecdote = async (anecdote) => {
    const createdAnecdote = await anecdoteService.createNew(anecdote)
    setAnecdotes(prevAnecdotes => prevAnecdotes.concat(createdAnecdote))
    return createdAnecdote
  }

  const deleteAnecdote = async (id) => {
    await anecdoteService.deleteOne(id)
    setAnecdotes(prevAnecdotes => prevAnecdotes.filter(anecdote => anecdote.id !== id))
  }

  const value = useMemo(() => ({
    anecdotes,
    addAnecdote,
    deleteAnecdote
  }), [anecdotes])

  return createElement(AnecdotesContext.Provider, { value }, children)
}

export const useAnecdotes = () => {
  const context = useContext(AnecdotesContext)

  if (!context) {
    throw new Error('useAnecdotes must be used within AnecdotesProvider')
  }

  return context
}
