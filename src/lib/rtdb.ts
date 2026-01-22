import {
  get,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  remove,
  set,
  update,
} from 'firebase/database'
import { db } from './firebase'
import type { ChecklistItem, Entry, Goal, Theme } from '../models/types'
import { buildSeedData } from '../models/defaults'

export const userRoot = (uid: string) => `users/${uid}`
export const bucketRoot = (uid: string) => `${userRoot(uid)}/bucket2026`
export const backupsRoot = (uid: string) => `${userRoot(uid)}/bucket2026_backups`

export const themesRef = (uid: string) => ref(db, `${bucketRoot(uid)}/themes`)
export const goalsRef = (uid: string) => ref(db, `${bucketRoot(uid)}/goals`)
export const checklistsRef = (uid: string, goalId: string) =>
  ref(db, `${bucketRoot(uid)}/checklists/${goalId}`)
export const entriesRef = (uid: string, goalId: string) =>
  ref(db, `${bucketRoot(uid)}/entries/${goalId}`)

const snapshotToArray = <T>(data: Record<string, T> | null): T[] => {
  if (!data) return []
  return Object.values(data)
}

export const ensureSeed = async (uid: string) => {
  const existing = await get(themesRef(uid))
  if (existing.exists()) return

  const seed = buildSeedData()
  const updates: Record<string, unknown> = {}
  Object.entries(seed.themes).forEach(([id, theme]) => {
    updates[`${bucketRoot(uid)}/themes/${id}`] = theme
  })
  Object.entries(seed.goals).forEach(([id, goal]) => {
    updates[`${bucketRoot(uid)}/goals/${id}`] = goal
  })
  Object.entries(seed.checklists).forEach(([goalId, items]) => {
    Object.entries(items).forEach(([itemId, item]) => {
      updates[`${bucketRoot(uid)}/checklists/${goalId}/${itemId}`] = item
    })
  })
  await update(ref(db), updates)
}

export const createTheme = async (uid: string, input: Partial<Theme>) => {
  const now = Date.now()
  const newRef = push(themesRef(uid))
  const theme: Theme = {
    id: newRef.key ?? '',
    title: input.title ?? 'Novo tema',
    description: input.description ?? '',
    icon: input.icon ?? '✨',
    color: input.color ?? '#2b7dff',
    order: input.order ?? now,
    createdAt: now,
    updatedAt: now,
  }
  await set(newRef, theme)
  return theme
}

export const updateTheme = async (uid: string, themeId: string, updates: Partial<Theme>) => {
  const now = Date.now()
  await update(ref(db, `${bucketRoot(uid)}/themes/${themeId}`), {
    ...updates,
    updatedAt: now,
  })
}

export const deleteTheme = async (uid: string, themeId: string, goalIds: string[] = []) => {
  const updates: Record<string, null> = {
    [`${bucketRoot(uid)}/themes/${themeId}`]: null,
  }
  goalIds.forEach((goalId) => {
    updates[`${bucketRoot(uid)}/goals/${goalId}`] = null
    updates[`${bucketRoot(uid)}/checklists/${goalId}`] = null
    updates[`${bucketRoot(uid)}/entries/${goalId}`] = null
  })
  await update(ref(db), updates)
}

export const createGoal = async (uid: string, input: Partial<Goal>) => {
  const now = Date.now()
  const newRef = push(goalsRef(uid))
  const goal: Goal = {
    id: newRef.key ?? '',
    themeId: input.themeId ?? '',
    title: input.title ?? 'Nova meta',
    description: input.description ?? '',
    status: input.status ?? 'planned',
    targetType: input.targetType ?? 'none',
    targetValue: input.targetValue ?? null,
    currentValue: input.currentValue ?? 0,
    priority: input.priority ?? 2,
    budgetPlanned: input.budgetPlanned ?? null,
    quarterHint: input.quarterHint ?? null,
    dueDate: input.dueDate ?? null,
    notesMarkdown: input.notesMarkdown ?? '',
    order: input.order ?? now,
    createdAt: now,
    updatedAt: now,
    doneAt: input.doneAt ?? null,
  }
  await set(newRef, goal)
  return goal
}

export const updateGoal = async (uid: string, goalId: string, updates: Partial<Goal>) => {
  const now = Date.now()
  await update(ref(db, `${bucketRoot(uid)}/goals/${goalId}`), {
    ...updates,
    updatedAt: now,
  })
}

export const deleteGoal = async (uid: string, goalId: string) => {
  const updates: Record<string, null> = {
    [`${bucketRoot(uid)}/goals/${goalId}`]: null,
    [`${bucketRoot(uid)}/checklists/${goalId}`]: null,
    [`${bucketRoot(uid)}/entries/${goalId}`]: null,
  }
  await update(ref(db), updates)
}

export const createChecklistItem = async (uid: string, goalId: string, text: string) => {
  const now = Date.now()
  const newRef = push(checklistsRef(uid, goalId))
  const item: ChecklistItem = {
    id: newRef.key ?? '',
    text,
    done: false,
    order: now,
    createdAt: now,
    updatedAt: now,
  }
  await set(newRef, item)
  return item
}

export const toggleChecklistItem = async (
  uid: string,
  goalId: string,
  itemId: string,
  done: boolean,
) => {
  const now = Date.now()
  await update(ref(db, `${bucketRoot(uid)}/checklists/${goalId}/${itemId}`), {
    done,
    updatedAt: now,
  })
}

export const reorderChecklist = async (uid: string, goalId: string, orderedIds: string[]) => {
  const updates: Record<string, number> = {}
  orderedIds.forEach((id, index) => {
    updates[`${bucketRoot(uid)}/checklists/${goalId}/${id}/order`] = index + 1
    updates[`${bucketRoot(uid)}/checklists/${goalId}/${id}/updatedAt`] = Date.now()
  })
  await update(ref(db), updates)
}

export const deleteChecklistItem = async (uid: string, goalId: string, itemId: string) => {
  await remove(ref(db, `${bucketRoot(uid)}/checklists/${goalId}/${itemId}`))
}

export const createEntry = async (uid: string, goal: Goal, input: Partial<Entry>) => {
  const now = Date.now()
  const newRef = push(entriesRef(uid, goal.id))
  const entry: Entry = {
    id: newRef.key ?? '',
    title: input.title ?? 'Registro',
    date: input.date ?? new Date().toISOString(),
    location: input.location ?? '',
    cost: input.cost ?? null,
    url: input.url ?? '',
    hasCinematicRecord: input.hasCinematicRecord ?? false,
    notesMarkdown: input.notesMarkdown ?? '',
    createdAt: now,
    updatedAt: now,
  }

  const updates: Record<string, unknown> = {
    [`${bucketRoot(uid)}/entries/${goal.id}/${entry.id}`]: entry,
  }

  if (goal.targetType === 'count') {
    const current = goal.currentValue ?? 0
    updates[`${bucketRoot(uid)}/goals/${goal.id}/currentValue`] = current + 1
    updates[`${bucketRoot(uid)}/goals/${goal.id}/updatedAt`] = now
  }

  await update(ref(db), updates)
  return entry
}

export const updateEntry = async (uid: string, goalId: string, entryId: string, updates: Partial<Entry>) => {
  const now = Date.now()
  await update(ref(db, `${bucketRoot(uid)}/entries/${goalId}/${entryId}`), {
    ...updates,
    updatedAt: now,
  })
}

export const deleteEntry = async (uid: string, goal: Goal, entryId: string) => {
  const updates: Record<string, unknown> = {
    [`${bucketRoot(uid)}/entries/${goal.id}/${entryId}`]: null,
  }
  if (goal.targetType === 'count') {
    const current = goal.currentValue ?? 0
    updates[`${bucketRoot(uid)}/goals/${goal.id}/currentValue`] = Math.max(0, current - 1)
    updates[`${bucketRoot(uid)}/goals/${goal.id}/updatedAt`] = Date.now()
  }
  await update(ref(db), updates)
}

export const subscribeThemes = (uid: string, callback: (themes: Theme[]) => void) => {
  const q = query(themesRef(uid), orderByChild('order'))
  return onValue(q, (snapshot) => {
    const themes = snapshotToArray<Theme>(snapshot.val())
    callback(themes)
  })
}

export const subscribeGoals = (uid: string, callback: (goals: Goal[]) => void) => {
  const q = query(goalsRef(uid), orderByChild('order'))
  return onValue(q, (snapshot) => {
    const goals = snapshotToArray<Goal>(snapshot.val())
    callback(goals)
  })
}

export const subscribeChecklist = (uid: string, goalId: string, callback: (items: ChecklistItem[]) => void) => {
  const q = query(checklistsRef(uid, goalId), orderByChild('order'))
  return onValue(q, (snapshot) => {
    const items = snapshotToArray<ChecklistItem>(snapshot.val())
    callback(items)
  })
}

export const subscribeEntries = (uid: string, goalId: string, callback: (entries: Entry[]) => void) => {
  const q = query(entriesRef(uid, goalId), orderByChild('date'))
  return onValue(q, (snapshot) => {
    const entries = snapshotToArray<Entry>(snapshot.val())
    callback(entries)
  })
}

export const bulkUpdateGoals = async (uid: string, goals: Goal[]) => {
  const updates: Record<string, unknown> = {}
  const now = Date.now()
  goals.forEach((goal) => {
    updates[`${bucketRoot(uid)}/goals/${goal.id}/order`] = goal.order
    updates[`${bucketRoot(uid)}/goals/${goal.id}/status`] = goal.status
    updates[`${bucketRoot(uid)}/goals/${goal.id}/updatedAt`] = now
  })
  await update(ref(db), updates)
}

export interface BucketBackup {
  meta: {
    version: 1
    exportedAt: number
  }
  data: {
    themes?: Record<string, Theme>
    goals?: Record<string, Goal>
    checklists?: Record<string, Record<string, ChecklistItem>>
    entries?: Record<string, Record<string, Entry>>
  }
}

export const getBucketBackup = async (uid: string): Promise<BucketBackup> => {
  const snapshot = await get(ref(db, bucketRoot(uid)))
  const data = (snapshot.val() ?? {}) as BucketBackup['data']
  return {
    meta: {
      version: 1,
      exportedAt: Date.now(),
    },
    data,
  }
}

export interface StoredBackup extends BucketBackup {
  id: string
}

export const createBackupSnapshot = async (uid: string): Promise<StoredBackup> => {
  const backup = await getBucketBackup(uid)
  const newRef = push(ref(db, backupsRoot(uid)))
  const payload = {
    ...backup,
    id: newRef.key ?? '',
  }
  await set(newRef, payload)
  return payload
}

export const subscribeBackups = (uid: string, callback: (backups: StoredBackup[]) => void) => {
  const q = query(ref(db, backupsRoot(uid)), orderByChild('meta/exportedAt'))
  return onValue(q, (snapshot) => {
    const data = snapshot.val() as Record<string, StoredBackup> | null
    const list = data ? Object.values(data).sort((a, b) => b.meta.exportedAt - a.meta.exportedAt) : []
    callback(list)
  })
}

export const restoreBackupById = async (uid: string, backupId: string) => {
  const snapshot = await get(ref(db, `${backupsRoot(uid)}/${backupId}`))
  if (!snapshot.exists()) return
  const backup = snapshot.val() as BucketBackup
  await set(ref(db, bucketRoot(uid)), backup.data ?? {})
}

export const deleteBackup = async (uid: string, backupId: string) => {
  await remove(ref(db, `${backupsRoot(uid)}/${backupId}`))
}

export const restoreBucketBackup = async (uid: string, backup: BucketBackup) => {
  await set(ref(db, bucketRoot(uid)), backup.data ?? {})
}

export const resetBucketData = async (uid: string) => {
  await remove(ref(db, bucketRoot(uid)))
}

export const applySeed = async (uid: string) => {
  const seed = buildSeedData()
  const updates: Record<string, unknown> = {}
  Object.entries(seed.themes).forEach(([id, theme]) => {
    updates[`${bucketRoot(uid)}/themes/${id}`] = theme
  })
  Object.entries(seed.goals).forEach(([id, goal]) => {
    updates[`${bucketRoot(uid)}/goals/${id}`] = goal
  })
  Object.entries(seed.checklists).forEach(([goalId, items]) => {
    Object.entries(items).forEach(([itemId, item]) => {
      updates[`${bucketRoot(uid)}/checklists/${goalId}/${itemId}`] = item
    })
  })
  await update(ref(db), updates)
}
