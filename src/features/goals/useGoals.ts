import { useEffect, useMemo, useState } from 'react'
import type { Goal } from '../../models/types'
import { subscribeGoals } from '../../lib/rtdb'
import { useAuth } from '../auth/AuthContext'

export const useGoals = () => {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeGoals(user.uid, (data) => {
      setGoals(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [user])

  const goalsByTheme = useMemo(() => {
    return goals.reduce<Record<string, Goal[]>>((acc, goal) => {
      acc[goal.themeId] = acc[goal.themeId] ?? []
      acc[goal.themeId].push(goal)
      return acc
    }, {})
  }, [goals])

  return { goals, goalsByTheme, loading }
}
