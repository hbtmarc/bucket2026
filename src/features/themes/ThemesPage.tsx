import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useThemes } from './useThemes'
import { useGoals } from '../goals/useGoals'
import { useAuth } from '../auth/AuthContext'
import { createTheme, deleteTheme, updateTheme } from '../../lib/rtdb'

export const ThemesPage = () => {
  const { user } = useAuth()
  const { themes } = useThemes()
  const { goals } = useGoals()
  const [title, setTitle] = useState('')
  const [drafts, setDrafts] = useState<Record<string, { title: string; description: string; icon: string; color: string }>>({})
  const [openEditors, setOpenEditors] = useState<Record<string, boolean>>({})
  const [openGoalLists, setOpenGoalLists] = useState<Record<string, boolean>>({})
  const [showAllGoals, setShowAllGoals] = useState(false)

  useEffect(() => {
    const nextDrafts: Record<string, { title: string; description: string; icon: string; color: string }> = {}
    themes.forEach((theme) => {
      nextDrafts[theme.id] = {
        title: theme.title,
        description: theme.description ?? '',
        icon: theme.icon ?? '✨',
        color: theme.color ?? '#2b7dff',
      }
    })
    setDrafts(nextDrafts)
    setOpenEditors((prev) => {
      const next = { ...prev }
      themes.forEach((theme) => {
        if (next[theme.id] === undefined) {
          next[theme.id] = false
        }
      })
      return next
    })
    setOpenGoalLists((prev) => {
      const next = { ...prev }
      themes.forEach((theme) => {
        if (next[theme.id] === undefined) {
          next[theme.id] = false
        }
      })
      return next
    })
  }, [themes])

  const handleCreate = async () => {
    if (!user || !title.trim()) return
    await createTheme(user.uid, { title: title.trim(), order: themes.length + 1 })
    setTitle('')
  }

  const handleUpdate = async (
    themeId: string,
    updates: { title?: string; description?: string; icon?: string; color?: string },
  ) => {
    if (!user) return
    await updateTheme(user.uid, themeId, updates)
  }

  const handleDelete = async (themeId: string) => {
    if (!user) return
    const goalIds = goals.filter((goal) => goal.themeId === themeId).map((goal) => goal.id)
    await deleteTheme(user.uid, themeId, goalIds)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Seus temas</h2>
            <p className="text-sm text-slate-500">Organize metas por áreas.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Novo tema"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
            />
            <button
              onClick={() => setShowAllGoals((prev) => !prev)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              {showAllGoals ? 'Ocultar resumo' : 'Resumo das metas'}
            </button>
            <button
              onClick={handleCreate}
              className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Criar
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {themes.map((theme) => {
          const themeGoals = goals.filter((goal) => goal.themeId === theme.id)
          const showGoals = showAllGoals || openGoalLists[theme.id]

          return (
            <div key={theme.id} className="rounded-3xl bg-white p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tema</p>
                <h3 className="text-lg font-semibold text-slate-800">
                  {theme.icon} {theme.title}
                </h3>
                <div className="mt-2">
                  <button
                    onClick={() =>
                      setOpenGoalLists((prev) => ({
                        ...prev,
                        [theme.id]: !prev[theme.id],
                      }))
                    }
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500"
                  >
                    {themeGoals.length} metas
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/theme/${theme.id}`}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500"
                >
                  Abrir
                </Link>
                <button
                  onClick={() =>
                    setOpenEditors((prev) => ({
                      ...prev,
                      [theme.id]: !prev[theme.id],
                    }))
                  }
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500"
                >
                  {openEditors[theme.id] ? 'Fechar edição' : 'Editar'}
                </button>
                <button
                  onClick={() => handleDelete(theme.id)}
                  className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-500"
                >
                  Excluir
                </button>
              </div>
            </div>
            {showGoals && (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {themeGoals.length ? (
                  <ul className="list-disc space-y-1 pl-4">
                    {themeGoals.map((goal) => (
                      <li key={goal.id}>{goal.title}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">Sem metas neste tema.</p>
                )}
              </div>
            )}
            {openEditors[theme.id] && (
              <div className="mt-4 space-y-2 text-sm text-slate-500">
                <label className="text-xs uppercase tracking-[0.2em]">Título</label>
                <input
                  value={drafts[theme.id]?.title ?? theme.title}
                  onChange={(event) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [theme.id]: { ...prev[theme.id], title: event.target.value },
                    }))
                  }
                  onBlur={() => handleUpdate(theme.id, { title: drafts[theme.id]?.title ?? theme.title })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
                />
                <label className="text-xs uppercase tracking-[0.2em]">Descrição</label>
                <textarea
                  value={drafts[theme.id]?.description ?? theme.description ?? ''}
                  onChange={(event) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [theme.id]: { ...prev[theme.id], description: event.target.value },
                    }))
                  }
                  onBlur={() =>
                    handleUpdate(theme.id, {
                      description: drafts[theme.id]?.description ?? theme.description ?? '',
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
                  rows={2}
                />
                <div className="grid gap-3 pt-2 sm:grid-cols-2">
                  <label className="text-xs uppercase tracking-[0.2em]">Ícone</label>
                  <label className="text-xs uppercase tracking-[0.2em]">Cor</label>
                  <input
                    value={drafts[theme.id]?.icon ?? theme.icon ?? '✨'}
                    onChange={(event) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [theme.id]: { ...prev[theme.id], icon: event.target.value },
                      }))
                    }
                    onBlur={() => handleUpdate(theme.id, { icon: drafts[theme.id]?.icon ?? theme.icon ?? '✨' })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
                    placeholder="🎯"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={drafts[theme.id]?.color ?? theme.color ?? '#2b7dff'}
                      onChange={(event) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [theme.id]: { ...prev[theme.id], color: event.target.value },
                        }))
                      }
                      onBlur={() =>
                        handleUpdate(theme.id, { color: drafts[theme.id]?.color ?? theme.color ?? '#2b7dff' })
                      }
                      className="h-10 w-12 rounded-lg border border-slate-200"
                    />
                    <input
                      value={drafts[theme.id]?.color ?? theme.color ?? '#2b7dff'}
                      onChange={(event) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [theme.id]: { ...prev[theme.id], color: event.target.value },
                        }))
                      }
                      onBlur={() =>
                        handleUpdate(theme.id, { color: drafts[theme.id]?.color ?? theme.color ?? '#2b7dff' })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          )
        })}
      </section>
    </div>
  )
}
