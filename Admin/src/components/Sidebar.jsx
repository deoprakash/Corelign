import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', path: '/', short: 'DB' },
  { label: 'Downloads', path: '/downloads', short: 'DL' },
  { label: 'Visitors', path: '/visitors', short: 'VS' },
  { label: 'Button Clicks', path: '/buttons', short: 'BC' },
  { label: 'Devices', path: '/devices', short: 'DV' },
  { label: 'Blocked IPs', path: '/blocked', short: 'IP' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 p-4 lg:block">
      <div className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col rounded-[2rem] border border-white/60 bg-white/70 p-4 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-base font-bold text-white shadow-lg shadow-slate-900/20">
            C
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800">Corelign</p>
            <p className="text-xs font-medium text-slate-400">Admin Console</p>
          </div>
        </div>

        <nav className="mt-7 space-y-1.5">
          {navItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition duration-300 ${
                  active
                    ? 'bg-slate-950 text-white shadow-lg shadow-slate-900/15'
                    : 'text-slate-600 hover:bg-white/80 hover:text-slate-950'
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-bold ${
                    active ? 'bg-white/15 text-white' : 'bg-teal-50 text-teal-700'
                  }`}
                >
                  {item.short}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto rounded-3xl border border-teal-100 bg-teal-50/70 p-4">
          <p className="text-sm font-semibold text-slate-800">Live analytics</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">Traffic, conversions, devices, and downloads in one clean view.</p>
        </div>
      </div>
    </aside>
  )
}
