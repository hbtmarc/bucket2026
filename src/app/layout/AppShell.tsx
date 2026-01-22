import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  children: React.ReactNode
}

export const AppShell = ({ children }: AppShellProps) => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <div className="flex min-h-screen">
      <aside className="hidden w-72 border-r border-slate-200 bg-white/70 backdrop-blur lg:block">
        <Sidebar />
      </aside>
      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 px-4 pb-20 pt-6 lg:px-8 lg:pb-8">{children}</main>
      </div>
    </div>
    <div className="lg:hidden">
      <BottomNav />
    </div>
  </div>
)
