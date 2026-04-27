// Arquivo de conveniencia: centraliza imports de formatacao usados por views/componentes.
// Diferente dos outros services, este nao chama API.
export { extractErrorMessage } from '@/services/api'
export {
  formatDayMonthYear,
  formatFullDateTime,
  formatRelative as formatRelativeTime,
  formatShortDateTime,
} from '@/utils/dates'
