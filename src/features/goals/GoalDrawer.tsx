import { useEffect, useMemo, useState } from 'react'
import type { ChecklistItem, Entry, Goal } from '../../models/types'
import { useAuth } from '../auth/AuthContext'
import {
  createChecklistItem,
  createEntry,
  deleteChecklistItem,
  deleteEntry,
  deleteGoal,
  reorderChecklist,
  subscribeChecklist,
  subscribeEntries,
  toggleChecklistItem,
  updateEntry,
  updateGoal,
} from '../../lib/rtdb'
import { MarkdownPreview } from '../../lib/markdown.tsx'
import { formatDate } from '../../lib/time'

interface GoalDrawerProps {
  goal: Goal
  onClose: () => void
}

const useChecklist = (goalId: string) => {
  const { user } = useAuth()
  const [items, setItems] = useState<ChecklistItem[]>([])

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeChecklist(user.uid, goalId, setItems)
    return () => unsubscribe()
  }, [goalId, user])

  return items
}

const useEntries = (goalId: string) => {
  const { user } = useAuth()
  const [items, setItems] = useState<Entry[]>([])

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeEntries(user.uid, goalId, setItems)
    return () => unsubscribe()
  }, [goalId, user])

  return items
}

export const GoalDrawer = ({ goal, onClose }: GoalDrawerProps) => {
  const { user } = useAuth()
  const [noteDraft, setNoteDraft] = useState(goal.notesMarkdown ?? '')
  const [draft, setDraft] = useState({
    title: goal.title,
    description: goal.description ?? '',
    status: goal.status,
    targetType: goal.targetType,
    targetValue: goal.targetValue ?? 0,
  })
  const [entryTitle, setEntryTitle] = useState('')
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10))
  const [entryLocation, setEntryLocation] = useState('')
  const [entryCost, setEntryCost] = useState('')
  const [entryUrl, setEntryUrl] = useState('')
  const [entryHasCinematic, setEntryHasCinematic] = useState(false)
  const [checklistText, setChecklistText] = useState('')

  const checklist = useChecklist(goal.id)
  const entries = useEntries(goal.id)

  useEffect(() => {
    setNoteDraft(goal.notesMarkdown ?? '')
    setDraft({
      title: goal.title,
      description: goal.description ?? '',
      status: goal.status,
      targetType: goal.targetType,
      targetValue: goal.targetValue ?? 0,
    })
  }, [goal])

  const handleGoalUpdate = async (updates: Partial<Goal>) => {
    if (!user) return
    await updateGoal(user.uid, goal.id, updates)
  }

  const handleCreateChecklist = async () => {
    if (!user || !checklistText.trim()) return
    await createChecklistItem(user.uid, goal.id, checklistText.trim())
    setChecklistText('')
  }

  const handleCreateEntry = async () => {
    if (!user || !entryTitle.trim()) return
    await createEntry(user.uid, goal, {
      title: entryTitle.trim(),
      date: new Date(entryDate).toISOString(),
      location: entryLocation.trim(),
      cost: entryCost ? Number(entryCost) : null,
      url: entryUrl.trim(),
      hasCinematicRecord: entryHasCinematic,
    })
    setEntryTitle('')
    setEntryLocation('')
    setEntryCost('')
    setEntryUrl('')
    setEntryHasCinematic(false)
  }

  const handleChecklistMove = async (itemId: string, direction: 'up' | 'down') => {
    if (!user) return
    const index = checklist.findIndex((item) => item.id === itemId)
    if (index === -1) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= checklist.length) return
    const updated = [...checklist]
    const [moved] = updated.splice(index, 1)
    updated.splice(targetIndex, 0, moved)
    await reorderChecklist(
      user.uid,
      goal.id,
      updated.map((item) => item.id),
    )
  }

  const checklistProgress = useMemo(() => {
    if (!checklist.length) return 0
    const done = checklist.filter((item) => item.done).length
    return Math.round((done / checklist.length) * 100)
  }, [checklist])

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40 p-4" role="dialog">
      <div className="h-full w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Meta</p>
            <h3 className="text-xl font-semibold text-slate-800">{goal.title}</h3>
          </div>
          <button onClick={onClose} className="rounded-full border border-slate-200 px-3 py-1 text-xs">
            Fechar
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          <label className="text-sm">
            Título
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={draft.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
              onBlur={() => handleGoalUpdate({ title: draft.title })}
            />
          </label>
          <label className="text-sm">
            Descrição
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              rows={2}
              value={draft.description}
              onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
              onBlur={() => handleGoalUpdate({ description: draft.description })}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Status
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={draft.status}
                onChange={(event) => {
                  const status = event.target.value as Goal['status']
                  setDraft((prev) => ({ ...prev, status }))
                  handleGoalUpdate({ status, doneAt: status === 'done' ? Date.now() : null })
                }}
              >
                <option value="backlog">Backlog</option>
                <option value="planned">Planejado</option>
                <option value="doing">Em progresso</option>
                <option value="done">Concluído</option>
              </select>
            </label>
            <label className="text-sm">
              Tipo de meta
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={draft.targetType}
                onChange={(event) => {
                  const targetType = event.target.value as Goal['targetType']
                  setDraft((prev) => ({ ...prev, targetType }))
                  handleGoalUpdate({ targetType })
                }}
              >
                <option value="none">Sem meta</option>
                <option value="count">Contagem</option>
                <option value="boolean">Boolean</option>
              </select>
            </label>
            {draft.targetType === 'count' && (
              <label className="text-sm">
                Meta (quantidade)
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={draft.targetValue}
                  onChange={(event) => setDraft((prev) => ({ ...prev, targetValue: Number(event.target.value) }))}
                  onBlur={() => handleGoalUpdate({ targetValue: draft.targetValue })}
                />
              </label>
            )}
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-700">Checklist</h4>
            <span className="text-xs text-slate-400">{checklistProgress}%</span>
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={checklistText}
              onChange={(event) => setChecklistText(event.target.value)}
              placeholder="Adicionar item"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              onClick={handleCreateChecklist}
              className="rounded-xl bg-brand-500 px-3 py-2 text-xs font-semibold text-white"
            >
              Adicionar
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-2">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={(event) => user && toggleChecklistItem(user.uid, goal.id, item.id, event.target.checked)}
                />
                <span className={`flex-1 text-sm ${item.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {item.text}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleChecklistMove(item.id, 'up')}
                    className="rounded-full border border-slate-200 px-2 text-xs"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleChecklistMove(item.id, 'down')}
                    className="rounded-full border border-slate-200 px-2 text-xs"
                  >
                    ↓
                  </button>
                </div>
                <button
                  onClick={() => user && deleteChecklistItem(user.uid, goal.id, item.id)}
                  className="text-xs text-rose-500"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-700">Entradas / Logs</h4>
            <span className="text-xs text-slate-400">{entries.length} registros</span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <input
              value={entryTitle}
              onChange={(event) => setEntryTitle(event.target.value)}
              placeholder="Título do registro"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={entryDate}
              onChange={(event) => setEntryDate(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              onClick={handleCreateEntry}
              className="rounded-xl bg-brand-500 px-3 py-2 text-xs font-semibold text-white"
            >
              Adicionar
            </button>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <input
              value={entryLocation}
              onChange={(event) => setEntryLocation(event.target.value)}
              placeholder="Local"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              type="number"
              value={entryCost}
              onChange={(event) => setEntryCost(event.target.value)}
              placeholder="Custo (R$)"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              value={entryUrl}
              onChange={(event) => setEntryUrl(event.target.value)}
              placeholder="URL"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <input
                type="checkbox"
                checked={entryHasCinematic}
                onChange={(event) => setEntryHasCinematic(event.target.checked)}
              />
              Registro cinemático
            </label>
          </div>
          <div className="mt-3 space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-slate-100 px-3 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{entry.title}</p>
                    <p className="text-xs text-slate-400">{formatDate(entry.date)}</p>
                  </div>
                  <button
                    onClick={() => user && deleteEntry(user.uid, goal, entry.id)}
                    className="text-xs text-rose-500"
                  >
                    Remover
                  </button>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <input
                    value={entry.location ?? ''}
                    onChange={(event) =>
                      user && updateEntry(user.uid, goal.id, entry.id, { location: event.target.value })
                    }
                    placeholder="Local"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                  <input
                    type="number"
                    value={entry.cost ?? ''}
                    onChange={(event) =>
                      user &&
                      updateEntry(user.uid, goal.id, entry.id, {
                        cost: event.target.value ? Number(event.target.value) : null,
                      })
                    }
                    placeholder="Custo"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                  <input
                    value={entry.url ?? ''}
                    onChange={(event) =>
                      user && updateEntry(user.uid, goal.id, entry.id, { url: event.target.value })
                    }
                    placeholder="URL"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                  <label className="flex items-center gap-2 text-xs text-slate-500">
                    <input
                      type="checkbox"
                      checked={entry.hasCinematicRecord ?? false}
                      onChange={(event) =>
                        user &&
                        updateEntry(user.uid, goal.id, entry.id, { hasCinematicRecord: event.target.checked })
                      }
                    />
                    Registro cinemático
                  </label>
                </div>
                <textarea
                  value={entry.notesMarkdown ?? ''}
                  onChange={(event) =>
                    user && updateEntry(user.uid, goal.id, entry.id, { notesMarkdown: event.target.value })
                  }
                  placeholder="Notas (markdown)"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  rows={2}
                />
                <div className="mt-2 rounded-xl bg-slate-50 p-2 text-xs text-slate-600">
                  <MarkdownPreview value={entry.notesMarkdown} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 p-4">
          <h4 className="text-sm font-semibold text-slate-700">Notas em Markdown</h4>
          <textarea
            value={noteDraft}
            onChange={(event) => setNoteDraft(event.target.value)}
            onBlur={() => handleGoalUpdate({ notesMarkdown: noteDraft })}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            rows={4}
          />
          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            <MarkdownPreview value={noteDraft} />
          </div>
        </section>

        <section className="mt-6 flex items-center justify-between">
          <button
            onClick={async () => {
              if (!user) return
              await deleteGoal(user.uid, goal.id)
              onClose()
            }}
            className="rounded-xl border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-500"
          >
            Excluir meta
          </button>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          >
            Concluir
          </button>
        </section>
      </div>
    </div>
  )
}
