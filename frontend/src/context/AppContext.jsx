import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { clearStoredUser, loadStoredUser, saveStoredUser } from '../lib/auth'

export const AppContext = createContext(null)

const VIEW_TO_ROUTE = {
  home: '/',
  landing: '/workspace',
  login: '/login',
  register: '/register',
  'forgot-password': '/login',
}

export function AppProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [view, setViewState] = useState(() => {
    if (location.pathname === '/login') return 'login'
    if (location.pathname === '/register') return 'register'
    if (location.pathname === '/workspace') return 'landing'
    return 'home'
  })
  const [currentUser, setCurrentUserState] = useState(() => loadStoredUser())

  useEffect(() => {
    if (location.pathname === '/login') {
      setViewState('login')
    } else if (location.pathname === '/register') {
      setViewState('register')
    } else if (location.pathname === '/workspace') {
      setViewState('landing')
    } else if (location.pathname === '/') {
      setViewState('home')
    }
  }, [location.pathname])

  const setView = useCallback(
    (nextView) => {
      setViewState(nextView)
      const route = VIEW_TO_ROUTE[nextView]
      if (route) {
        navigate(route)
      }
    },
    [navigate],
  )

  const setCurrentUser = useCallback((user) => {
    setCurrentUserState(user)
    if (user) {
      saveStoredUser(user)
    } else {
      clearStoredUser()
    }
  }, [])

  const logout = useCallback(() => {
    try {
      console.log('Logout initiated')
      clearStoredUser()
      setCurrentUserState(null)
      setViewState('home')
      navigate('/', { replace: true })
      console.log('Logout completed')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [navigate])

 

  const value = useMemo(
    () => ({ view, setView, currentUser, setCurrentUser, logout }),
    [currentUser, logout, setCurrentUser, setView, view],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export default AppContext
