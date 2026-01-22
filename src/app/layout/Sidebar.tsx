import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/kanban', label: 'Kanban', icon: '🧩' },
  { to: '/themes', label: 'Temas', icon: '🎯' },
  { to: '/settings', label: 'Configurações', icon: '⚙️' },
]

export const Sidebar = () => (
  <div className="flex h-full flex-col justify-between p-6">
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-brand-500">Bucket 2026</p>
        <h2 className="text-lg font-semibold text-slate-900">Painel pessoal</h2>
      </div>
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
    <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-4 text-white shadow-card">
      <p className="text-sm font-semibold">Meta do dia</p>
      <p className="text-xs text-white/80">Escolha uma pequena ação e registre no app.</p>
    </div>
  </div>
)
