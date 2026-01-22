import { useMemo } from 'react'
import { useThemes } from '../themes/useThemes'
import { useGoals } from '../goals/useGoals'
import type { Goal } from '../../models/types'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { updateGoal } from '../../lib/rtdb'

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
  const done = goals.filter((goal) => {
    if (goal.status === 'done') return true
    if (goal.targetType === 'count' && goal.targetValue) {
      return (goal.currentValue ?? 0) >= goal.targetValue
    }
    return false
  }).length
  return Math.round((done / goals.length) * 100)
}

export const DashboardPage = () => {
  const { user } = useAuth()
  const { themes } = useThemes()
  const { goals, goalsByTheme } = useGoals()

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
          <h3 className="text-lg font-semibold">Ações rápidas</h3>
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
                  {themeGoals.map((goal) => (
                    <label
                      key={goal.id}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={goal.status === 'done'}
                        onChange={(event) => handleToggle(goal, event.target.checked)}
                      />
                      <span
                        className={goal.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700'}
                      >
                        {goal.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )
          })}
          {!orderedGoals.length && (
            <p className="text-sm text-slate-500">Sem metas cadastradas.</p>
          )}
        </div>
      </section>
    </div>
  )
}
