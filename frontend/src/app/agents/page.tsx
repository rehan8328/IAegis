'use client'
import { useQuery } from '@tanstack/react-query'
import { Shell } from '@/components/layout/Shell'
import { getAgents } from '@/lib/api'
import { relativeTime, cn } from '@/lib/utils'
import { MonitorDot } from 'lucide-react'

export default function AgentsPage() {
  const { data: agents = [], isLoading } = useQuery({ queryKey: ['agents'], queryFn: getAgents, refetchInterval: 15000 })
  const online = agents.filter(a=>a.status==='online').length

  return (
    <Shell title="Assets">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-6">
          {[['Online',online,'text-accent','bg-accent'],['Offline',agents.length-online,'text-gray-500','bg-gray-600'],['Total',agents.length,'text-white','']].map(([l,v,c,d])=>(
            <div key={String(l)} className="flex items-center gap-2">
              {d && <div className={cn('w-2 h-2 rounded-full',String(d))}/>}
              <span className={cn('text-[14px] font-bold',String(c))}>{v}</span>
              <span className="text-[12px] text-gray-500">{l}</span>
            </div>
          ))}
        </div>

        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              {['Status','Hostname','IP Address','OS','Agent Version','Last Seen','Registered'].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-gray-500">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={7} className="px-4 py-10 text-center text-[12px] text-gray-600">Loading...</td></tr>
              : agents.length===0 ? (
                <tr><td colSpan={7} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <MonitorDot className="w-8 h-8 text-gray-700"/>
                    <p className="text-[12px] text-gray-600">No agents registered yet</p>
                    <p className="text-[11px] text-gray-700">Run start_agent.bat to connect an endpoint</p>
                  </div>
                </td></tr>
              ) : agents.map(a=>(
                <tr key={a.id} className="border-b border-border/50 hover:bg-bg-hover transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={cn('w-2 h-2 rounded-full', a.status==='online'?'bg-accent shadow-[0_0_6px_#22c55e]':a.status==='isolated'?'bg-yellow-500':'bg-gray-600')}/>
                      <span className={cn('text-[10px] font-mono font-bold uppercase', a.status==='online'?'text-accent':a.status==='isolated'?'text-yellow-400':'text-gray-500')}>{a.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-mono text-gray-200">{a.hostname}</p>
                    <p className="text-[10px] font-mono text-gray-600 mt-0.5">{a.id.slice(0,16)}…</p>
                  </td>
                  <td className="px-4 py-3"><span className="text-[12px] font-mono text-gray-400">{a.ip_address||'—'}</span></td>
                  <td className="px-4 py-3"><span className="text-[12px] text-gray-400">{a.os_name} {a.os_version}</span></td>
                  <td className="px-4 py-3"><span className="text-[11px] font-mono text-gray-500">v{a.agent_version||'—'}</span></td>
                  <td className="px-4 py-3"><span className="text-[12px] text-gray-400">{relativeTime(a.last_seen)}</span></td>
                  <td className="px-4 py-3"><span className="text-[11px] text-gray-500">{relativeTime(a.registered_at)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  )
}
