import { useEffect, useState } from 'react'
import type { Theme } from '../../models/types'
import { subscribeThemes } from '../../lib/rtdb'
import { useAuth } from '../auth/AuthContext'

export const useThemes = () => {
  const { user } = useAuth()
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeThemes(user.uid, (data) => {
      setThemes(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [user])

  return { themes, loading }
}
