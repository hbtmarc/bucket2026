import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { User } from 'firebase/auth'
import { observeAuth, signIn, signOutUser, signUp } from '../../lib/auth'
import { ensureSeed } from '../../lib/rtdb'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = observeAuth(async (nextUser) => {
      setUser(nextUser)
      if (nextUser) {
        await ensureSeed(nextUser.uid)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signInWithEmail: async (email: string, password: string) => {
        await signIn(email, password)
      },
      signUpWithEmail: async (email: string, password: string) => {
        await signUp(email, password)
      },
      signOut: async () => signOutUser(),
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
