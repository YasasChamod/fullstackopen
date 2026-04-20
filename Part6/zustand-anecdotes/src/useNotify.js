import { useContext } from 'react'
import { NotificationContext } from './NotificationContext'

export const useNotify = () => {
  const { showNotification, clearNotification } = useContext(NotificationContext)

  return {
    notify: showNotification,
    clearNotification,
  }
}

export const useNotificationValue = () => {
  const { notification } = useContext(NotificationContext)

  return notification
}
