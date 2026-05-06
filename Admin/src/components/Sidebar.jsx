import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', path: '/', icon: '📊' },
  { label: 'Downloads', path: '/downloads', icon: '⬇️' },
  { label: 'Visitors', path: '/visitors', icon: '👥' },
  { label: 'Button Clicks', path: '/buttons', icon: '🖱️' },
  { label: 'Devices', path: '/devices', icon: '📱' },
  { label: 'Blocked IPs', path: '/blocked', icon: '🚫' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 border-r border-slate-200 bg-white">
      <nav className="space-y-2 p-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
              location.pathname === item.path
                ? 'bg-teal-50 text-teal-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
