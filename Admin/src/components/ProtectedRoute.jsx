import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AdminContext } from '../context/AdminContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useContext(AdminContext)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
