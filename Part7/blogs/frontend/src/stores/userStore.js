import { create } from 'zustand'
import blogService from '../services/blogs'
import loginService from '../services/login'
import persistentUserService from '../services/persistentUser'

const useUserStore = create((set) => ({
  user: null,

  initializeUser: () => {
    const loggedUser = persistentUserService.getUser()
    if (loggedUser) {
      blogService.setToken(loggedUser.token)
      set({ user: loggedUser })
    }
  },

  loginUser: async ({ username, password }) => {
    const loggedInUser = await loginService.login({ username, password })
    blogService.setToken(loggedInUser.token)
    persistentUserService.saveUser(loggedInUser)
    set({ user: loggedInUser })
    return loggedInUser
  },

  logoutUser: () => {
    persistentUserService.removeUser()
    blogService.setToken(null)
    set({ user: null })
  },
}))

export default useUserStore
