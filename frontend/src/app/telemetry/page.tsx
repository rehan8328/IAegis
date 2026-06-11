'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Shell } from '@/components/layout/Shell'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { getEvents } from '@/lib/api'
import { eventTypeLabel, eventTypeBg, relativeTime, formatTs } from '@/lib/utils'
import type { TelemetryEvent } from '@/types'

export default function TelemetryPage() {
  const [eventType, setEventType] = useState('')
  const [hours, setHours] = useState(6)
  const [selected, setSelected] = useState<TelemetryEvent|null>(null)

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', eventType, hours],
    queryFn: () => getEvents({ event_type: eventType||undefined, hours, limit: 500 }),
    refetchInterval: 15000,
  })

  const TYPES = ['','process_start','process_end','network_connection','file_write','file_delete','auth_event','dns_query','command_exec','persistence_change']

  return (
    <Shell title="Monitoring">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          {[TYPES].map(opts => (
            <select key="t" value={eventType} onChange={e=>setEventType(e.target.value)} className="bg-bg-card border border-border rounded-lg px-3 py-1.5 text-[12px] text-gray-300 focus:outline-none focus:border-accent/50">
              <option value="">All Event Types</option>
              {TYPES.slice(1).map(t=><option key={t} value={t}>{eventTypeLabel(t)}</option>)}
            </select>
          ))}
          <select value={hours} onChange={e=>setHours(Number(e.target.value))} className="bg-bg-card border border-border rounded-lg px-3 py-1.5 text-[12px] text-gray-300 focus:outline-none focus:border-accent/50">
            {[1,6,24,72].map(h=><option key={h} value={h}>Last {h}h</option>)}
          </select>
          <span className="ml-auto text-[12px] text-gray-500 font-mono">{events.length} events</span>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 min-w-0 bg-bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {['Time','Type','Host','Summary','Sev'].map(h=><th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-gray-500">{h}</th>)}
              </tr></thead>
              <tbody>
                {isLoading ? <tr><td colSpan={5} className="px-4 py-10 text-center text-[12px] text-gray-600">Loading...</td></tr>
                : events.length===0 ? <tr><td colSpan={5} className="px-4 py-16 text-center text-[12px] text-gray-600">No events found</td></tr>
                : events.map(e=>(
                  <tr key={e.id} onClick={()=>setSelected(selected?.id===e.id?null:e)}
                    className={`border-b border-border/50 cursor-pointer transition-colors ${selected?.id===e.id?'bg-bg-hover border-l-2 border-l-accent':'hover:bg-bg-hover'}`}>
                    <td className="px-4 py-2"><span className="text-[10px] font-mono text-gray-500">{relativeTime(e.timestamp)}</span></td>
                    <td className="px-4 py-2"><span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${eventTypeBg(e.event_type)}`}>{eventTypeLabel(e.event_type)}</span></td>
                    <td className="px-4 py-2"><span className="text-[11px] font-mono text-gray-400">{e.hostname || e.agent_id.slice(0,12)}</span></td>
                    <td className="px-4 py-2 max-w-xs"><span className="text-[11px] text-gray-400 font-mono truncate block">{getSummary(e)}</span></td>
                    <td className="px-4 py-2">{e.severity!=='info'&&<SeverityBadge severity={e.severity}/>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selected && (
            <div className="w-80 shrink-0 bg-bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border"><span className="text-[12px] font-semibold text-gray-300">Event #{selected.id}</span></div>
              <div className="p-4 space-y-4">
                <div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${eventTypeBg(selected.event_type)}`}>{eventTypeLabel(selected.event_type)}</span>
                  <p className="text-[11px] font-mono text-gray-400 mt-2">{formatTs(selected.timestamp)}</p>
                  <p className="text-[12px] text-gray-300 mt-1 font-mono">{selected.hostname || selected.agent_id}</p>
                </div>
                {selected.severity!=='info'&&<SeverityBadge severity={selected.severity}/>}
                <div>
                  <p className="text-[10px] text-gray-500 mb-1.5">RAW DATA</p>
                  <div className="bg-bg-primary rounded-lg border border-border p-3 max-h-72 overflow-y-auto">
                    <pre className="text-[10px] font-mono text-gray-400 whitespace-pre-wrap break-all">{JSON.stringify(selected.data,null,2)}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Shell>
  )
}
function getSummary(e: TelemetryEvent) {
  const d = e.data
  switch(e.event_type) {
    case 'process_start': return String(d.process_name||d.cmdline||'').slice(0,80)
    case 'network_connection': return `${d.dst_host||d.remote_address}:${d.dst_port}`
    case 'file_write': case 'file_delete': return String(d.path||'').slice(0,80)
    case 'dns_query': return String(d.query||d.domain||d.dns_server||'')
    case 'auth_event': return `${d.user} — ${d.action}`
    case 'command_exec': return String(d.cmdline||'').slice(0,80)
    default: return JSON.stringify(d).slice(0,80)
  }
}
