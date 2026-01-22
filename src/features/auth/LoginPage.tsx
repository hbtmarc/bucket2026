import { useState } from 'react'
import { useAuth } from './AuthContext'

const errorMap: Record<string, string> = {
  'auth/invalid-credential': 'Credenciais inválidas. Confira email e senha.',
  'auth/email-already-in-use': 'Esse email já está em uso.',
  'auth/weak-password': 'Senha muito curta. Use pelo menos 6 caracteres.',
}

export const LoginPage = () => {
  const { signInWithEmail, signUpWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (isRegister) {
        await signUpWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
    } catch (err) {
      const code = (err as { code?: string }).code ?? 'auth/unknown'
      setError(errorMap[code] ?? 'Não foi possível autenticar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Bucket 2026</p>
          <h1 className="text-3xl font-semibold">Entre para organizar sua jornada</h1>
          <p className="text-sm text-slate-300">Login com email e senha. Primeiro acesso cria o seed automático.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-ink-900/70 p-6 shadow-card">
          <label className="space-y-2 text-sm">
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-ink-700 bg-ink-900 px-4 py-2 text-white outline-none focus:border-brand-400"
              placeholder="voce@email.com"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Senha</span>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-ink-700 bg-ink-900 px-4 py-2 text-white outline-none focus:border-brand-400"
              placeholder="********"
            />
          </label>
          {error && <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-500 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-400 disabled:opacity-60"
          >
            {loading ? 'Aguarde...' : isRegister ? 'Criar conta' : 'Entrar'}
          </button>
          <button
            type="button"
            onClick={() => setIsRegister((value) => !value)}
            className="w-full rounded-xl border border-ink-700 py-2 text-sm text-slate-200 hover:border-brand-400"
          >
            {isRegister ? 'Já tenho conta' : 'Criar conta com email'}
          </button>
        </form>
      </div>
    </div>
  )
}
