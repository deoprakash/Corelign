import { useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AdminContext } from '../context/AdminContext'

const mobileLinks = [
  { label: 'Dashboard', path: '/' },
  { label: 'Downloads', path: '/downloads' },
  { label: 'Visitors', path: '/visitors' },
  { label: 'Buttons', path: '/buttons' },
  { label: 'Devices', path: '/devices' },
  { label: 'Blocked', path: '/blocked' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useContext(AdminContext)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="mx-auto w-full max-w-[1500px] px-4 pt-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-white/60 bg-white/70 px-4 py-4 shadow-lg shadow-slate-900/5 backdrop-blur-xl sm:px-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-700">Corelign Admin</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Analytics Dashboard</h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200/70 bg-white/55 p-1 lg:hidden">
              {mobileLinks.map((link) => {
                const active = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      active ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-white hover:text-slate-950'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            <button type="button" onClick={handleLogout} className="btn-ghost justify-center bg-white/50">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
