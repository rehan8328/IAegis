'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Shell } from '@/components/layout/Shell'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { MitreBadge } from '@/components/ui/MitreBadge'
import { getIncident, updateIncident } from '@/lib/api'
import { scoreColor, formatTs, cn } from '@/lib/utils'
import { ArrowLeft, Clock } from 'lucide-react'

const ST: Record<string,string> = { open:'bg-red-500/15 text-red-400 border border-red-500/30', investigating:'bg-blue-500/15 text-blue-400 border border-blue-500/30', contained:'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30', resolved:'bg-green-500/15 text-green-400 border border-green-500/30', closed:'bg-gray-500/15 text-gray-400 border border-gray-500/30' }
const DOT: Record<string,string> = { critical:'bg-red-500', high:'bg-orange-500', medium:'bg-yellow-500', low:'bg-accent', info:'bg-gray-500' }

export default function IncidentDetailPage() {
  const { id } = useParams()
  const qc = useQueryClient()
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  const { data: inc, isLoading } = useQuery({ queryKey: ['incident', id], queryFn: () => getIncident(Number(id)), refetchInterval: 30000 })
  const mut = useMutation({ mutationFn: (p: any) => updateIncident(Number(id), p), onSuccess: () => { qc.invalidateQueries({ queryKey: ['incident', id] }); qc.invalidateQueries({ queryKey: ['incidents'] }) } })

  if (isLoading) return <Shell title="Incident"><div className="p-6 text-gray-500 font-mono text-[12px]">Loading...</div></Shell>
  if (!inc) return <Shell title="Not Found"><div className="p-6 text-gray-500 font-mono text-[12px]">Incident not found.</div></Shell>

  return (
    <Shell title={`INC-${inc.id}`}>
      <div className="p-6 max-w-6xl space-y-5">
        <div className="flex items-start gap-4">
          <Link href="/incidents" className="mt-1 text-gray-500 hover:text-gray-300 transition-colors"><ArrowLeft className="w-5 h-5"/></Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[12px] font-mono text-gray-500">INC-{inc.id}</span>
              <SeverityBadge severity={inc.severity}/>
              <span className={cn('text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase', ST[inc.status]||'')}>{inc.status}</span>
              <span className={`text-[13px] font-bold font-mono ${scoreColor(inc.threat_score)}`}>SCORE {inc.threat_score.toFixed(0)}/100</span>
            </div>
            <h1 className="text-[20px] font-bold text-white mt-1">{inc.title}</h1>
            {inc.summary && <p className="text-[13px] text-gray-400 mt-1">{inc.summary}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 space-y-4">
            {/* Timeline */}
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <h2 className="text-[13px] font-semibold text-white mb-4">Incident Timeline</h2>
              <div className="space-y-0">
                {(inc.timeline||[]).map((entry, i)=>(
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center w-5 shrink-0">
                      <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', DOT[entry.severity||'info']||'bg-accent')}/>
                      {i < inc.timeline.length-1 && <div className="w-px flex-1 bg-border mt-1 mb-1"/>}
                    </div>
                    <div className="pb-4">
                      <p className="text-[13px] text-gray-300">{entry.event}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-600"/>
                        <span className="text-[10px] font-mono text-gray-600">{formatTs(entry.timestamp)}</span>
                        {entry.mitre && <MitreBadge id={entry.mitre}/>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analyst notes */}
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <h2 className="text-[13px] font-semibold text-white mb-3">Analyst Notes</h2>
              <textarea className="w-full bg-bg-primary border border-border rounded-lg p-3 text-[12px] font-mono text-gray-300 resize-none focus:outline-none focus:border-accent/50" rows={5} placeholder="Add investigation notes..." defaultValue={inc.analyst_notes||''} onChange={e=>setNotes(e.target.value)}/>
              <button onClick={()=>{mut.mutate({analyst_notes:notes});setSaved(true);setTimeout(()=>setSaved(false),2000)}} className="mt-2 px-4 py-1.5 bg-accent/20 border border-accent/40 rounded-lg text-[11px] font-mono text-accent hover:bg-accent/30 transition-colors">
                {saved ? '✓ Saved' : 'Save Notes'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Status */}
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <h2 className="text-[13px] font-semibold text-white mb-3">Status</h2>
              <div className="space-y-1.5">
                {['open','investigating','contained','resolved','closed'].map(s=>(
                  <button key={s} onClick={()=>mut.mutate({status:s})} disabled={inc.status===s}
                    className={cn('w-full px-3 py-2 rounded-lg border text-[11px] font-mono text-left transition-colors', inc.status===s?'bg-accent/20 border-accent/40 text-accent':'border-border text-gray-500 hover:text-gray-200 hover:border-border-light disabled:opacity-40')}>
                    {s.toUpperCase()}{inc.status===s?' ← current':''}
                  </button>
                ))}
              </div>
            </div>

            {/* Meta */}
            <div className="bg-bg-card border border-border rounded-xl p-4 space-y-2">
              <h2 className="text-[13px] font-semibold text-white mb-2">Details</h2>
              {[['Threat Score',`${inc.threat_score.toFixed(1)}/100`],['Detections',String(inc.detection_ids.length)],['Agents',String(inc.affected_agents.length)],['Created',formatTs(inc.created_at)],inc.resolved_at?['Resolved',formatTs(inc.resolved_at)]:null].filter(Boolean).map(([l,v]:any)=>(
                <div key={l} className="flex justify-between gap-2">
                  <span className="text-[11px] text-gray-500">{l}</span>
                  <span className="text-[11px] font-mono text-gray-300">{v}</span>
                </div>
              ))}
            </div>

            {/* MITRE */}
            {inc.mitre_techniques.length > 0 && (
              <div className="bg-bg-card border border-border rounded-xl p-4">
                <h2 className="text-[13px] font-semibold text-white mb-2">MITRE ATT&CK</h2>
                <div className="flex flex-wrap gap-1.5">{inc.mitre_techniques.map(t=><MitreBadge key={t} id={t}/>)}</div>
              </div>
            )}

            {/* Affected agents */}
            {inc.affected_agents.length > 0 && (
              <div className="bg-bg-card border border-border rounded-xl p-4">
                <h2 className="text-[13px] font-semibold text-white mb-2">Affected Hosts</h2>
                <div className="space-y-1">
                  {inc.affected_agents.map(a=><div key={a} className="text-[11px] font-mono text-gray-400 bg-bg-primary px-2 py-1 rounded border border-border">{a}</div>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  )
}
