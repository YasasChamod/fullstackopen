import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AnecdoteList from './AnecdoteList'
import { anecdoteStore } from '../store'

describe('AnecdoteList', () => {
  beforeEach(() => {
    anecdoteStore.setState({
      anecdotes: [],
      filter: '',
    })
    vi.restoreAllMocks()
  })

  it('renders anecdotes sorted by votes in descending order', () => {
    anecdoteStore.setState({
      anecdotes: [
        { id: '1', content: 'lowest votes', votes: 1 },
        { id: '2', content: 'highest votes', votes: 8 },
        { id: '3', content: 'middle votes', votes: 4 },
      ],
      filter: '',
    })

    render(<AnecdoteList />)

    const contentsInOrder = screen
      .getAllByRole('button', { name: 'vote' })
      .map((button) => button.closest('div').previousElementSibling.textContent)

    expect(contentsInOrder).toEqual([
      'highest votes',
      'middle votes',
      'lowest votes',
    ])
  })

  it('renders only anecdotes matching filter', () => {
    anecdoteStore.setState({
      anecdotes: [
        { id: '1', content: 'react is great', votes: 0 },
        { id: '2', content: 'zustand is simple', votes: 0 },
        { id: '3', content: 'react testing', votes: 0 },
      ],
      filter: 'react',
    })

    render(<AnecdoteList />)

    expect(screen.getByText('react is great')).toBeInTheDocument()
    expect(screen.getByText('react testing')).toBeInTheDocument()
    expect(screen.queryByText('zustand is simple')).not.toBeInTheDocument()
  })

  it('increases votes by one when voting', async () => {
    anecdoteStore.setState({
      anecdotes: [{ id: '1', content: 'vote me', votes: 2 }],
      filter: '',
    })

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: async () => ({ id: '1', content: 'vote me', votes: 3 }),
    })

    render(<AnecdoteList />)

    fireEvent.click(screen.getByRole('button', { name: 'vote' }))

    await waitFor(() => {
      expect(anecdoteStore.getState().anecdotes[0].votes).toBe(3)
    })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/anecdotes/1',
      expect.objectContaining({ method: 'PUT' })
    )
  })
})
