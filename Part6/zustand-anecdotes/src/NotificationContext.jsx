import { createContext, useEffect, useRef, useState } from 'react'

export const NotificationContext = createContext({
  notification: '',
  showNotification: () => {},
  clearNotification: () => {},
})

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState('')
  const timeoutRef = useRef(null)

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const clearNotification = () => {
    clearTimer()
    setNotification('')
  }

  const showNotification = (message, duration = 5000) => {
    setNotification(message)
    clearTimer()

    timeoutRef.current = setTimeout(() => {
      setNotification('')
      timeoutRef.current = null
    }, duration)
  }

  useEffect(() => {
    return () => clearTimer()
  }, [])

  return (
    <NotificationContext.Provider
      value={{ notification, showNotification, clearNotification }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
