import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useThemes } from './useThemes'
import { useGoals } from '../goals/useGoals'
import { useAuth } from '../auth/AuthContext'
import { createGoal } from '../../lib/rtdb'
import { GoalDrawer } from '../goals/GoalDrawer.tsx'

export const ThemeDetailPage = () => {
  const { themeId } = useParams()
  const { user } = useAuth()
  const { themes } = useThemes()
  const { goals } = useGoals()
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [title, setTitle] = useState('')

  const theme = useMemo(() => themes.find((item) => item.id === themeId), [themes, themeId])
  const themeGoals = useMemo(() => goals.filter((goal) => goal.themeId === themeId), [goals, themeId])
  const selectedGoal = useMemo(
    () => themeGoals.find((goal) => goal.id === selectedGoalId) ?? null,
    [themeGoals, selectedGoalId],
  )

  const handleCreateGoal = async () => {
    if (!user || !themeId || !title.trim()) return
    const goal = await createGoal(user.uid, {
      themeId,
      title: title.trim(),
      status: 'planned',
      order: themeGoals.length + 1,
      targetType: 'none',
      priority: 2,
    })
    setTitle('')
    setSelectedGoalId(goal.id)
  }

  if (!theme) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-card">
        <p className="text-slate-500">Tema não encontrado.</p>
        <Link to="/themes" className="text-sm text-brand-600">Voltar</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tema</p>
            <h2 className="text-xl font-semibold text-slate-800">
              {theme.icon} {theme.title}
            </h2>
            <p className="text-sm text-slate-500">{theme.description}</p>
          </div>
          <Link to="/themes" className="text-sm font-semibold text-brand-600">Voltar aos temas</Link>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Metas do tema</h3>
            <p className="text-sm text-slate-500">Clique em uma meta para editar.</p>
          </div>
          <div className="flex gap-2">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Nova meta"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
            />
            <button
              onClick={handleCreateGoal}
              className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Adicionar
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {themeGoals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => setSelectedGoalId(goal.id)}
              className="rounded-2xl border border-slate-200 px-4 py-4 text-left text-sm shadow-sm transition hover:border-brand-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-slate-400">{goal.status}</p>
                  <h4 className="font-semibold text-slate-800">{goal.title}</h4>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">{goal.targetType}</span>
              </div>
              {goal.description && <p className="mt-2 text-xs text-slate-500">{goal.description}</p>}
            </button>
          ))}
        </div>
      </section>

      {selectedGoal && (
        <GoalDrawer goal={selectedGoal} onClose={() => setSelectedGoalId(null)} />
      )}
    </div>
  )
}
