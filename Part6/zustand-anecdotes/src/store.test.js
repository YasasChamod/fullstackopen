import { beforeEach, describe, expect, it, vi } from 'vitest'
import { anecdoteStore } from './store'

describe('anecdote store', () => {
  beforeEach(() => {
    anecdoteStore.setState({ anecdotes: [], filter: '' })
    vi.restoreAllMocks()
  })

  it('sets anecdotes from query result', () => {
    const anecdotesFromQuery = [
      { id: '1', content: 'first anecdote', votes: 2 },
      { id: '2', content: 'second anecdote', votes: 5 },
    ]

    anecdoteStore.getState().actions.setAnecdotes(anecdotesFromQuery)

    expect(anecdoteStore.getState().anecdotes).toEqual(anecdotesFromQuery)
  })
})
