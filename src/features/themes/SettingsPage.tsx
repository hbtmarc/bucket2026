import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import {
  applySeed,
  createBackupSnapshot,
  deleteBackup,
  resetBucketData,
  restoreBackupById,
  subscribeBackups,
  type StoredBackup,
} from '../../lib/rtdb'
import { formatDateTime } from '../../lib/time'

export const SettingsPage = () => {
  const { user } = useAuth()
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [backups, setBackups] = useState<StoredBackup[]>([])

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeBackups(user.uid, setBackups)
    return () => unsubscribe()
  }, [user])

  const handleBackup = async () => {
    if (!user) return
    setLoading(true)
    setStatus(null)
    try {
      await createBackupSnapshot(user.uid)
      setStatus('Snapshot salvo no RTDB com sucesso.')
    } catch (error) {
      setStatus('Não foi possível salvar o snapshot.')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (backupId: string) => {
    if (!user) return
    const confirmed = window.confirm('Deseja restaurar este snapshot? Isso irá substituir os dados atuais.')
    if (!confirmed) return
    setLoading(true)
    setStatus(null)
    try {
      await restoreBackupById(user.uid, backupId)
      setStatus('Snapshot restaurado com sucesso.')
    } catch (error) {
      setStatus('Falha ao restaurar o snapshot.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!user) return
    const confirmed = window.confirm('Tem certeza? Isso apaga todos os dados da sua conta.')
    if (!confirmed) return
    setLoading(true)
    setStatus(null)
    try {
      await resetBucketData(user.uid)
      setStatus('Dados apagados com sucesso. Atualize a página se necessário.')
    } catch (error) {
      setStatus('Não foi possível apagar os dados.')
    } finally {
      setLoading(false)
    }
  }

  const handleMigrateThemes = async () => {
    if (!user) return
    const confirmed = window.confirm('Isso irá substituir seus dados atuais pelos novos temas padrão. Continuar?')
    if (!confirmed) return
    setLoading(true)
    setStatus(null)
    try {
      await resetBucketData(user.uid)
      await applySeed(user.uid)
      setStatus('Temas migrados com sucesso para a nova estrutura.')
    } catch (error) {
      setStatus('Não foi possível migrar os temas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-card">
        <h2 className="text-lg font-semibold">Configurações</h2>
        <p className="mt-2 text-sm text-slate-500">
          Backup, restauração e reset da base. Use com cuidado.
        </p>
        {status && (
          <p className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
            {status}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
          <h3 className="text-sm font-semibold">Backup</h3>
          <p className="mt-2 text-xs text-slate-500">Crie um snapshot direto no RTDB.</p>
          <button
            onClick={handleBackup}
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Salvar snapshot
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
          <h3 className="text-sm font-semibold">Restaurar</h3>
          <p className="mt-2 text-xs text-slate-500">Selecione um snapshot salvo para restaurar.</p>
          <div className="mt-4 space-y-2">
            {backups.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-2 text-xs">
                <div>
                  <p className="font-semibold text-slate-700">Snapshot</p>
                  <p className="text-slate-400">{formatDateTime(new Date(backup.meta.exportedAt).toISOString())}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(backup.id)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
                  >
                    Restaurar
                  </button>
                  <button
                    onClick={() => user && deleteBackup(user.uid, backup.id)}
                    className="rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-500"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
            {!backups.length && <p className="text-xs text-slate-400">Nenhum snapshot salvo.</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-card">
          <h3 className="text-sm font-semibold text-amber-600">Migrar temas</h3>
          <p className="mt-2 text-xs text-amber-400">
            Substitui seus dados pelos novos temas padrão (com seed atualizado).
          </p>
          <button
            onClick={handleMigrateThemes}
            disabled={loading}
            className="mt-4 w-full rounded-xl border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-600 disabled:opacity-60"
          >
            Migrar agora
          </button>
        </div>

        <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-card">
          <h3 className="text-sm font-semibold text-rose-600">Reset</h3>
          <p className="mt-2 text-xs text-rose-400">Apaga tudo. Use apenas se tiver backup.</p>
          <button
            onClick={handleReset}
            disabled={loading}
            className="mt-4 w-full rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 disabled:opacity-60"
          >
            Apagar dados
          </button>
        </div>
      </div>
    </div>
  )
}
