import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd'
import { useEffect, useMemo, useState } from 'react'
import { useGoals } from '../goals/useGoals'
import { useThemes } from '../themes/useThemes'
import type { Goal, GoalStatus } from '../../models/types'
import { useAuth } from '../auth/AuthContext'
import { bulkUpdateGoals } from '../../lib/rtdb'

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

  useEffect(() => {
    setLocalGoals(goals)
  }, [goals])

  const normalizedGoals = useMemo(() => (localGoals.length ? localGoals : goals), [goals, localGoals])

  const grouped = useMemo(() => {
    const result: Record<string, Record<GoalStatus, Goal[]>> = {}
    themes.forEach((theme) => {
      result[theme.id] = {
        backlog: [],
        planned: [],
        doing: [],
        done: [],
      }
    })
    normalizedGoals.forEach((goal) => {
      if (!result[goal.themeId]) {
        result[goal.themeId] = {
          backlog: [],
          planned: [],
          doing: [],
          done: [],
        }
      }
      result[goal.themeId][goal.status].push(goal)
    })
    Object.keys(result).forEach((themeId) => {
      Object.keys(result[themeId]).forEach((statusKey) => {
        result[themeId][statusKey as GoalStatus] = sortByOrder(result[themeId][statusKey as GoalStatus])
      })
    })
    return result
  }, [normalizedGoals, themes])

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !user) return

    const sourceMeta = parseDroppableId(result.source.droppableId)
    const destMeta = parseDroppableId(result.destination.droppableId)

    const sourceItems = Array.from(grouped[sourceMeta.themeId]?.[sourceMeta.status] ?? [])
    const [moved] = sourceItems.splice(result.source.index, 1)
    const destItems =
      sourceMeta.themeId === destMeta.themeId && sourceMeta.status === destMeta.status
        ? sourceItems
        : Array.from(grouped[destMeta.themeId]?.[destMeta.status] ?? [])
    destItems.splice(result.destination.index, 0, { ...moved, status: destMeta.status })

    const updatedGoals: Goal[] = []

    const updateOrders = (items: Goal[]) =>
      items.map((goal, index) => ({ ...goal, order: index + 1 }))

    const isSameColumn =
      sourceMeta.themeId === destMeta.themeId && sourceMeta.status === destMeta.status
    const updatedSource = updateOrders(isSameColumn ? destItems : sourceItems)
    const updatedDest = isSameColumn ? [] : updateOrders(destItems)

    updatedGoals.push(...updatedSource)
    updatedGoals.push(...updatedDest)

    setLocalGoals(
      normalizedGoals.map((goal) => updatedGoals.find((updated) => updated.id === goal.id) ?? goal),
    )

    await bulkUpdateGoals(user.uid, updatedGoals)
  }

  const themeLookup = useMemo(
    () => Object.fromEntries(themes.map((theme) => [theme.id, theme])),
    [themes],
  )

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-card">
        <h2 className="text-lg font-semibold">Kanban de Metas</h2>
        <p className="text-sm text-slate-500">Arraste cards para atualizar o status.</p>
      </section>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-6">
          {themes.map((theme) => (
            <section key={theme.id} className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-card">
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
                                  <p className="text-xs text-slate-500">{goal.targetType}</p>
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
    </div>
  )
}
