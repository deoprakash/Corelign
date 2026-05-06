import { useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AdminContext } from '../context/AdminContext'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useContext(AdminContext)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-teal-700">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <h1 className="text-xl font-bold text-slate-900">Corelign Admin</h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">Analytics Dashboard</span>
          <button onClick={handleLogout} className="btn-ghost text-sm">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
