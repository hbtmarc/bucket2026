import { useEffect, useMemo, useState } from 'react'
import { useThemes } from '../themes/useThemes'
import { useGoals } from '../goals/useGoals'
import type { Goal } from '../../models/types'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { createGoal, updateGoal } from '../../lib/rtdb'
import { GoalDrawer } from '../goals/GoalDrawer.tsx'

const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
  const rad = ((angle - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

const describeSlice = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1'
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
}

const computeProgress = (goals: Goal[]) => {
  if (!goals.length) return 0
  const progress = goals.reduce((sum, goal) => {
    const statusProgress = goal.status === 'done' ? 1 : goal.status === 'doing' ? 0.5 : 0

    if (goal.targetType === 'count' && goal.targetValue) {
      const ratio = Math.min(1, (goal.currentValue ?? 0) / goal.targetValue)
      return sum + Math.max(statusProgress, ratio)
    }

    return sum + statusProgress
  }, 0)

  return Math.round((progress / goals.length) * 100)
}

export const DashboardPage = () => {
  const { user } = useAuth()
  const { themes } = useThemes()
  const { goals, goalsByTheme } = useGoals()
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [newGoalTitle, setNewGoalTitle] = useState('')
  const [newGoalThemeId, setNewGoalThemeId] = useState<string | null>(null)

  useEffect(() => {
    if (!newGoalThemeId && themes.length) {
      setNewGoalThemeId(themes[0].id)
    }
  }, [newGoalThemeId, themes])

  const progressByTheme = useMemo(() => {
    return themes.map((theme) => ({
      theme,
      progress: computeProgress(goalsByTheme[theme.id] ?? []),
    }))
  }, [themes, goalsByTheme])

  const sliceAngle = progressByTheme.length ? 360 / progressByTheme.length : 60

  const orderedGoals = useMemo(() => {
    const weight = (goal: Goal) => (goal.status === 'done' ? 1 : 0)
    return [...goals].sort((a, b) => weight(a) - weight(b) || a.order - b.order)
  }, [goals])

  const selectedGoal = useMemo(
    () => goals.find((goal) => goal.id === selectedGoalId) ?? null,
    [goals, selectedGoalId],
  )

  const orderedThemes = useMemo(
    () => [...themes].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })),
    [themes],
  )

  const handleCreateGoal = async () => {
    if (!user || !newGoalTitle.trim() || !newGoalThemeId) return
    const goal = await createGoal(user.uid, {
      themeId: newGoalThemeId,
      title: newGoalTitle.trim(),
      status: 'planned',
      order: (goalsByTheme[newGoalThemeId]?.length ?? 0) + 1,
      targetType: 'none',
      priority: 2,
    })
    setNewGoalTitle('')
    setSelectedGoalId(goal.id)
  }

  const handleToggle = async (goal: Goal, done: boolean) => {
    if (!user) return
    await updateGoal(user.uid, goal.id, {
      status: done ? 'done' : 'planned',
      doneAt: done ? Date.now() : null,
    })
  }

  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-[1.1fr_1fr]">
      <section className="h-full rounded-3xl bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Wheel of Life</h2>
              <p className="text-sm text-slate-500">Progresso por tema</p>
            </div>
            <Link to="/themes" className="text-xs font-semibold text-brand-600">Ver temas</Link>
          </div>
          <div className="mt-6 flex flex-col items-center gap-6 md:flex-row">
            <svg viewBox="0 0 200 200" className="h-48 w-48">
              {progressByTheme.map(({ theme, progress }, index) => {
                const startAngle = index * sliceAngle
                const endAngle = startAngle + sliceAngle
                return (
                  <path
                    key={theme.id}
                    d={describeSlice(100, 100, 90, startAngle, endAngle)}
                    fill={theme.color ?? '#94a3b8'}
                    opacity={0.25 + progress / 130}
                  />
                )
              })}
              <circle cx="100" cy="100" r="48" fill="#ffffff" />
              <text x="100" y="105" textAnchor="middle" className="fill-slate-700 text-sm font-semibold">
                2026
              </text>
            </svg>
            <div className="flex-1 space-y-4">
              {progressByTheme.map(({ theme, progress }) => (
                <div key={theme.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      {theme.icon} {theme.title}
                    </span>
                    <span className="text-slate-500">{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${progress}%`, backgroundColor: theme.color ?? '#4b5a72' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
      </section>

      <section className="h-full space-y-4">
        <div className="flex h-full min-h-0 flex-col rounded-3xl bg-white p-6 shadow-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold">Ações rápidas</h3>
            <div className="flex flex-1 flex-wrap gap-2 sm:justify-end">
              <input
                value={newGoalTitle}
                onChange={(event) => setNewGoalTitle(event.target.value)}
                placeholder="Nova tarefa"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm sm:w-56"
              />
              <select
                value={newGoalThemeId ?? ''}
                onChange={(event) => setNewGoalThemeId(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm sm:w-44"
              >
                {orderedThemes.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.icon} {theme.title}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCreateGoal}
                className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
              >
                Criar
              </button>
            </div>
          </div>
          <div className="mt-4 grid flex-1 min-h-0 gap-3 overflow-y-auto pr-2 md:grid-cols-2">
            {themes.map((theme) => (
              <Link
                key={theme.id}
                to={`/theme/${theme.id}`}
                className="rounded-2xl border border-slate-200 px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-600"
              >
                {theme.icon} {theme.title}
              </Link>
            ))}
            <Link
              to="/kanban"
              className="rounded-2xl border border-slate-200 px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-600"
            >
              🧩 Abrir Kanban
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-card lg:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Atividades</h3>
            <p className="text-sm text-slate-500">Checklist rápido das metas.</p>
          </div>
        </div>
        <div className="mt-4 space-y-6">
          {themes.map((theme) => {
            const themeGoals = (goalsByTheme[theme.id] ?? []).sort(
              (a, b) => (a.status === 'done' ? 1 : 0) - (b.status === 'done' ? 1 : 0) || a.order - b.order,
            )
            if (!themeGoals.length) return null
            return (
              <div key={theme.id} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="text-base">{theme.icon}</span>
                  {theme.title}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {themeGoals.map((goal) => {
                    const inputId = `goal-toggle-${goal.id}`
                    return (
                      <div
                        key={goal.id}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                          goal.status === 'done'
                            ? 'border-slate-200'
                            : goal.status === 'doing'
                              ? 'border-brand-200 bg-brand-50/60'
                              : 'border-slate-200'
                        }`}
                      >
                        <input
                          id={inputId}
                          type="checkbox"
                          checked={goal.status === 'done'}
                          onChange={(event) => handleToggle(goal, event.target.checked)}
                        />
                        <label
                          htmlFor={inputId}
                          className={
                            goal.status === 'done' ? 'flex-1 text-slate-400 line-through' : 'flex-1 text-slate-700'
                          }
                        >
                          {goal.title}
                        </label>
                        {goal.status === 'doing' && (
                          <span className="rounded-full bg-brand-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-600">
                            Em progresso
                          </span>
                        )}
                        <button
                          onClick={() => setSelectedGoalId(goal.id)}
                          className="rounded-full border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-500"
                        >
                          Editar
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {!orderedGoals.length && (
            <p className="text-sm text-slate-500">Sem metas cadastradas.</p>
          )}
        </div>
      </section>

      {selectedGoal && (
        <GoalDrawer goal={selectedGoal} onClose={() => setSelectedGoalId(null)} />
      )}
    </div>
  )
}
