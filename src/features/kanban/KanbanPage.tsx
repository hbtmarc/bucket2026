import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd'
import { useEffect, useMemo, useState } from 'react'
import { createGoal, bulkUpdateGoals } from '../../lib/rtdb'
import type { Goal, GoalStatus } from '../../models/types'
import { useAuth } from '../auth/AuthContext'
import { GoalDrawer } from '../goals/GoalDrawer.tsx'
import { useGoals } from '../goals/useGoals'
import { useThemes } from '../themes/useThemes'

const columns: { key: GoalStatus; label: string }[] = [
  { key: 'backlog', label: 'Backlog' },
  { key: 'planned', label: 'Planejado' },
  { key: 'doing', label: 'Em progresso' },
  { key: 'done', label: 'Concluído' },
]

const sortByOrder = (goals: Goal[]) => [...goals].sort((a, b) => a.order - b.order)
const buildDroppableId = (themeId: string, status: GoalStatus) => `${themeId}:${status}`
const parseDroppableId = (value: string) => {
  const [themeId, status] = value.split(':')
  return { themeId, status: status as GoalStatus }
}

export const KanbanPage = () => {
  const { user } = useAuth()
  const { goals } = useGoals()
  const { themes } = useThemes()
  const [localGoals, setLocalGoals] = useState<Goal[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [newGoalTitle, setNewGoalTitle] = useState('')
  const [newGoalThemeId, setNewGoalThemeId] = useState<string | null>(null)
  const [newGoalStatus, setNewGoalStatus] = useState<GoalStatus>('planned')

  useEffect(() => {
    setLocalGoals(goals)
  }, [goals])

  const orderedThemesForSelect = useMemo(
    () => [...themes].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR')),
    [themes],
  )

  useEffect(() => {
    if (!newGoalThemeId && orderedThemesForSelect.length) {
      setNewGoalThemeId(orderedThemesForSelect[0].id)
    }
  }, [newGoalThemeId, orderedThemesForSelect])

  const normalizedGoals = useMemo(() => (localGoals.length ? localGoals : goals), [goals, localGoals])

  const selectedGoal = useMemo(
    () => normalizedGoals.find((goal) => goal.id === selectedGoalId) ?? null,
    [normalizedGoals, selectedGoalId],
  )

  const themeLookup = useMemo(
    () =>
      themes.reduce<Record<string, typeof themes[number]>>((acc, theme) => {
        acc[theme.id] = theme
        return acc
      }, {}),
    [themes],
  )

  const grouped = useMemo(() => {
    const byTheme: Record<string, Record<GoalStatus, Goal[]>> = {}

    themes.forEach((theme) => {
      byTheme[theme.id] = {
        backlog: [],
        planned: [],
        doing: [],
        done: [],
      }
    })

    normalizedGoals.forEach((goal) => {
      const bucket = byTheme[goal.themeId] ?? {
        backlog: [],
        planned: [],
        doing: [],
        done: [],
      }
      bucket[goal.status].push(goal)
      byTheme[goal.themeId] = bucket
    })

    Object.values(byTheme).forEach((statusMap) => {
      columns.forEach((column) => {
        statusMap[column.key] = sortByOrder(statusMap[column.key])
      })
    })

    return byTheme
  }, [normalizedGoals, themes])

  const orderedThemes = useMemo(() => {
    return [...themes]
      .map((theme) => ({
        theme,
        doingCount: grouped[theme.id]?.doing.length ?? 0,
      }))
      .sort((a, b) => {
        if (b.doingCount !== a.doingCount) return b.doingCount - a.doingCount
        return a.theme.title.localeCompare(b.theme.title, 'pt-BR')
      })
      .map((item) => item.theme)
  }, [grouped, themes])

  const handleDragEnd = async ({ destination, source, draggableId }: DropResult) => {
    if (!destination || !user) return

    const sourceInfo = parseDroppableId(source.droppableId)
    const destInfo = parseDroppableId(destination.droppableId)

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const movingGoal = normalizedGoals.find((goal) => goal.id === draggableId)
    if (!movingGoal) return

    const draft = normalizedGoals.map((goal) => ({ ...goal }))

    const sourceList = draft.filter(
      (goal) => goal.themeId === sourceInfo.themeId && goal.status === sourceInfo.status && goal.id !== draggableId,
    )
    const destList = draft.filter(
      (goal) => goal.themeId === destInfo.themeId && goal.status === destInfo.status && goal.id !== draggableId,
    )

    const updatedMoving: Goal = {
      ...movingGoal,
      themeId: destInfo.themeId,
      status: destInfo.status,
    }

    if (sourceInfo.themeId === destInfo.themeId && sourceInfo.status === destInfo.status) {
      sourceList.splice(destination.index, 0, updatedMoving)
      const reordered = sourceList.map((goal, index) => ({ ...goal, order: index + 1 }))
      const finalGoals = draft.map((goal) => {
        if (goal.themeId === sourceInfo.themeId && goal.status === sourceInfo.status) {
          const replacement = reordered.find((item) => item.id === goal.id)
          if (replacement) return replacement
        }
        return goal
      })
      setLocalGoals(finalGoals)
      await bulkUpdateGoals(user.uid, reordered)
      return
    }

    destList.splice(destination.index, 0, updatedMoving)

    const updatedColumns: Goal[] = [
      ...sourceList.map((goal, index) => ({ ...goal, order: index + 1 })),
      ...destList.map((goal, index) => ({ ...goal, order: index + 1 })),
    ]

    const finalGoals = draft.map((goal) => {
      if (goal.themeId === sourceInfo.themeId && goal.status === sourceInfo.status) {
        const replacement = updatedColumns.find((item) => item.id === goal.id)
        if (replacement) return replacement
      }
      if (goal.themeId === destInfo.themeId && goal.status === destInfo.status) {
        const replacement = updatedColumns.find((item) => item.id === goal.id)
        if (replacement) return replacement
      }
      return goal
    })

    setLocalGoals(finalGoals)
    await bulkUpdateGoals(user.uid, updatedColumns)
  }

  const handleCreateGoal = async () => {
    if (!user || !newGoalThemeId) return
    const title = newGoalTitle.trim()
    if (!title) return

    const currentCount = grouped[newGoalThemeId]?.[newGoalStatus]?.length ?? 0
    await createGoal(user.uid, {
      title,
      themeId: newGoalThemeId,
      status: newGoalStatus,
      order: currentCount + 1,
    })
    setNewGoalTitle('')
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Kanban de Metas</h2>
            <p className="text-sm text-slate-500">Arraste cards para atualizar o status.</p>
          </div>
          <div className="flex flex-wrap gap-2">
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
              {orderedThemesForSelect.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.icon} {theme.title}
                </option>
              ))}
            </select>
            <select
              value={newGoalStatus}
              onChange={(event) => setNewGoalStatus(event.target.value as GoalStatus)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm sm:w-40"
            >
              {columns.map((column) => (
                <option key={column.key} value={column.key}>
                  {column.label}
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
      </section>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-6">
          {orderedThemes.map((theme) => (
            <section
              key={theme.id}
              className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-card"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tema</p>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {theme.icon} {theme.title}
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  {(grouped[theme.id]?.backlog.length ?? 0) +
                    (grouped[theme.id]?.planned.length ?? 0) +
                    (grouped[theme.id]?.doing.length ?? 0) +
                    (grouped[theme.id]?.done.length ?? 0)}{' '}
                  metas
                </span>
              </div>
              <div className="grid gap-4 lg:grid-cols-4">
                {columns.map((column) => (
                  <Droppable key={column.key} droppableId={buildDroppableId(theme.id, column.key)}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="rounded-2xl border border-slate-200 bg-white/70 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-slate-700">{column.label}</h4>
                          <span className="text-xs text-slate-400">
                            {grouped[theme.id]?.[column.key]?.length ?? 0}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {(grouped[theme.id]?.[column.key] ?? []).map((goal, index) => (
                            <Draggable key={goal.id} draggableId={goal.id} index={index}>
                              {(dragProvided) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm shadow-sm"
                                >
                                  <p className="text-xs uppercase text-slate-400">
                                    {themeLookup[goal.themeId]?.icon} {themeLookup[goal.themeId]?.title}
                                  </p>
                                  <p className="mt-1 font-semibold text-slate-800">{goal.title}</p>
                                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                                    <span className="capitalize">{column.label}</span>
                                    <button
                                      onClick={() => setSelectedGoalId(goal.id)}
                                      className="rounded-full border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-500"
                                    >
                                      Editar
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </section>
          ))}
        </div>
      </DragDropContext>

      {selectedGoal && <GoalDrawer goal={selectedGoal} onClose={() => setSelectedGoalId(null)} />}
    </div>
  )
}
