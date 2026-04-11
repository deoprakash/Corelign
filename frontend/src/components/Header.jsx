import { NavLink } from 'react-router-dom'
import logo from '../assets/corelignLogo.png'

export default function Header() {
  const linkClass = ({ isActive }) => (isActive ? 'text-slate-900' : 'hover:text-slate-900')

  return (
    <header className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-6 pb-4 pt-8">
      <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center">
            <img src={logo} alt="Corelign" className="object-contain" />
          </div>
        <div>
          <p className="text-xl font-semibold text-slate-600">Corelign</p>
          <p className="text-xs text-slate-400">Intelligent RAG Platform</p>
        </div>
      </div>
      <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
        <NavLink to="/" end className={linkClass}>
          Home
        </NavLink>
        <NavLink to="/about" className={linkClass}>
          About Us
        </NavLink>
        <NavLink to="/workspace" className={linkClass}>
          Workspace
        </NavLink>
        <NavLink to="/insights" className={linkClass}>
          Insights
        </NavLink>
        <button className="btn-primary">Book a demo</button>
      </nav>
    </header>
  )
}
