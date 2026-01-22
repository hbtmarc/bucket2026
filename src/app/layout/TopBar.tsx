import { useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'

const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/kanban': 'Kanban',
  '/themes': 'Temas',
}

export const TopBar = () => {
  const location = useLocation()
  const { signOut, user } = useAuth()

  const label = routeLabels[location.pathname] ?? 'Bucket 2026'

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brand-500">Bucket 2026</p>
          <h1 className="text-xl font-semibold text-slate-900">{label}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right text-xs text-slate-500 md:block">
            <p className="font-medium text-slate-700">{user?.email}</p>
            <p>Conta ativa</p>
          </div>
          <button
            onClick={() => signOut()}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-600"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
