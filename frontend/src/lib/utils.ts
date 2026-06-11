import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const severityBg = (s: string) => ({ critical:'bg-red-500/15 text-red-400 border border-red-500/30', high:'bg-orange-500/15 text-orange-400 border border-orange-500/30', medium:'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30', low:'bg-green-500/15 text-green-400 border border-green-500/30', info:'bg-gray-500/15 text-gray-400 border border-gray-500/30' }[s] || 'bg-gray-500/15 text-gray-400')

export const severityDot = (s: string) => ({ critical:'bg-red-500', high:'bg-orange-500', medium:'bg-yellow-500', low:'bg-green-500', info:'bg-gray-500' }[s] || 'bg-gray-600')

export const scoreColor = (n: number) => n>=90?'text-red-400':n>=75?'text-orange-400':n>=50?'text-yellow-400':n>=25?'text-green-400':'text-gray-500'

export const relativeTime = (ts: string) => { try { return formatDistanceToNow(new Date(ts),{addSuffix:true}) } catch { return ts } }
export const formatTs = (ts: string) => { try { return format(new Date(ts),'HH:mm:ss dd/MM') } catch { return ts } }

export const eventTypeLabel = (t: string) => ({ process_start:'PROC START', process_end:'PROC END', network_connection:'NET CONN', file_write:'FILE WRITE', file_delete:'FILE DEL', auth_event:'AUTH', dns_query:'DNS', command_exec:'CMD EXEC', persistence_change:'PERSIST', system_info:'SYS INFO' }[t] || t.toUpperCase())

export const eventTypeBg = (t: string) => ({ process_start:'bg-blue-500/15 text-blue-400', process_end:'bg-gray-500/15 text-gray-400', network_connection:'bg-purple-500/15 text-purple-400', file_write:'bg-yellow-500/15 text-yellow-400', file_delete:'bg-red-500/15 text-red-400', auth_event:'bg-green-500/15 text-green-400', dns_query:'bg-cyan-500/15 text-cyan-400', command_exec:'bg-orange-500/15 text-orange-400', persistence_change:'bg-pink-500/15 text-pink-400' }[t] || 'bg-gray-500/15 text-gray-400')
