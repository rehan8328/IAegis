'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Shell } from '@/components/layout/Shell'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { getIncidents } from '@/lib/api'
import { scoreColor, relativeTime, cn } from '@/lib/utils'
import { Shield } from 'lucide-react'

const ST: Record<string,string> = { open:'bg-red-500/15 text-red-400', investigating:'bg-blue-500/15 text-blue-400', contained:'bg-yellow-500/15 text-yellow-400', resolved:'bg-green-500/15 text-green-400', closed:'bg-gray-500/15 text-gray-400' }

export default function IncidentsPage() {
  const [status, setStatus] = useState('')
  const { data: incidents = [], isLoading } = useQuery({ queryKey: ['incidents', status], queryFn: () => getIncidents({ status: status||undefined, limit: 100 }), refetchInterval: 15000 })

  return (
    <Shell title="Incidents">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <select value={status} onChange={e=>setStatus(e.target.value)} className="bg-bg-card border border-border rounded-lg px-3 py-1.5 text-[12px] text-gray-300 focus:outline-none focus:border-accent/50">
            {[['','All Statuses'],['open','Open'],['investigating','Investigating'],['contained','Contained'],['resolved','Resolved'],['closed','Closed']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
          <span className="ml-auto text-[12px] text-gray-500 font-mono">{incidents.length} incidents</span>
        </div>

        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              {['ID','Severity','Title','Status','Score','Detections','Created'].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-gray-500">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={7} className="px-4 py-10 text-center text-[12px] text-gray-600">Loading...</td></tr>
              : incidents.length===0 ? (
                <tr><td colSpan={7} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Shield className="w-8 h-8 text-gray-700"/>
                    <p className="text-[12px] text-gray-600">No incidents — run inject_test_data.bat to trigger detections</p>
                  </div>
                </td></tr>
              ) : incidents.map(inc=>(
                <tr key={inc.id} className="border-b border-border/50 hover:bg-bg-hover transition-colors">
                  <td className="px-4 py-3"><Link href={`/incidents/${inc.id}`} className="text-[12px] font-mono text-accent hover:underline">INC-{inc.id}</Link></td>
                  <td className="px-4 py-3"><SeverityBadge severity={inc.severity}/></td>
                  <td className="px-4 py-3 max-w-xs">
                    <Link href={`/incidents/${inc.id}`} className="text-[13px] text-gray-200 hover:text-white truncate block">{inc.title}</Link>
                    {inc.summary && <p className="text-[11px] text-gray-500 truncate mt-0.5">{inc.summary}</p>}
                  </td>
                  <td className="px-4 py-3"><span className={cn('text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase', ST[inc.status]||'')}>{inc.status}</span></td>
                  <td className="px-4 py-3"><span className={`text-[13px] font-bold font-mono ${scoreColor(inc.threat_score)}`}>{inc.threat_score.toFixed(0)}</span></td>
                  <td className="px-4 py-3"><span className="text-[12px] font-mono text-gray-400">{inc.detection_ids.length}</span></td>
                  <td className="px-4 py-3"><span className="text-[11px] text-gray-500">{relativeTime(inc.created_at)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  )
}
