
import { create } from 'zustand'

const baseUrl = 'http://localhost:3001/anecdotes'

export const anecdoteStore = create((set, get) => ({
  anecdotes: [],
  filter: '',
  actions: {
    setAnecdotes: (anecdotes) => set({ anecdotes }),
    create: async (content, callbacks = {}) => {
      const newAnecdote = {
        content,
        votes: 0,
      }

      try {
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newAnecdote),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create anecdote')
        }

        const createdAnecdote = await response.json()

        set((state) => ({
          anecdotes: state.anecdotes.concat(createdAnecdote),
        }))

        callbacks.onSuccess?.(createdAnecdote)

        return createdAnecdote
      } catch (error) {
        console.error('Failed to create anecdote', error)
        callbacks.onError?.(error)
        return null
      }
    },
    vote: async (id) => {
      const anecdote = get().anecdotes.find((item) => item.id === id)
      if (!anecdote) {
        return null
      }

      const updatedAnecdote = {
        ...anecdote,
        votes: anecdote.votes + 1,
      }

      try {
        const response = await fetch(`${baseUrl}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedAnecdote),
        })
        const returnedAnecdote = await response.json()

        set((state) => ({
          anecdotes: state.anecdotes.map((item) =>
            item.id === id ? returnedAnecdote : item
          ),
        }))

        return returnedAnecdote
      } catch (error) {
        console.error('Failed to vote anecdote', error)
        return null
      }
    },
    remove: async (id) => {
      try {
        await fetch(`${baseUrl}/${id}`, {
          method: 'DELETE',
        })
        set((state) => ({
          anecdotes: state.anecdotes.filter((item) => item.id !== id),
        }))
      } catch (error) {
        console.error('Failed to delete anecdote', error)
      }
    },
    setFilter: (filter) => set({ filter }),
  },
}))

export const useAnecdotes = () => anecdoteStore((state) => state.anecdotes)
export const useFilter = () => anecdoteStore((state) => state.filter)
export const useAnecdoteActions = () => anecdoteStore((state) => state.actions)
