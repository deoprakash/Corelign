import { createContext, useState } from 'react'

export const AdminContext = createContext()

export function AdminProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminPassword'))
  const [adminPassword, setAdminPassword] = useState(localStorage.getItem('adminPassword') || '')

  const login = (password) => {
    localStorage.setItem('adminPassword', password)
    setAdminPassword(password)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('adminPassword')
    setAdminPassword('')
    setIsAuthenticated(false)
  }

  return (
    <AdminContext.Provider value={{ isAuthenticated, adminPassword, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}
