import { create } from 'zustand'

const useNotificationStore = create((set, get) => ({
  message: null,
  type: null,
  timeoutId: null,

  clearNotification: () => {
    const { timeoutId } = get()
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    set({ message: null, type: null, timeoutId: null })
  },

  showNotification: (message, type = 'success', duration = 5000) => {
    const { timeoutId } = get()
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    const newTimeoutId = setTimeout(() => {
      set({ message: null, type: null, timeoutId: null })
    }, duration)

    set({ message, type, timeoutId: newTimeoutId })
  },
}))

export default useNotificationStore
