import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/kanban', label: 'Kanban', icon: '🧩' },
  { to: '/themes', label: 'Temas', icon: '🎯' },
  { to: '/settings', label: 'Config', icon: '⚙️' },
]

export const BottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-2 backdrop-blur">
    <div className="mx-auto flex max-w-lg items-center justify-between">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs ${
              isActive ? 'text-brand-600' : 'text-slate-500'
            }`
          }
        >
          <span className="text-lg">{link.icon}</span>
          {link.label}
        </NavLink>
      ))}
    </div>
  </nav>
)
