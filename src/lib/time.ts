import { format, parseISO } from 'date-fns'

export const formatDate = (value?: string | null) => {
  if (!value) return ''
  return format(parseISO(value), 'dd/MM/yyyy')
}

export const formatDateTime = (value?: string | null) => {
  if (!value) return ''
  return format(parseISO(value), 'dd/MM/yyyy HH:mm')
}
