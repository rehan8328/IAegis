'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shell } from '@/components/layout/Shell'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { MitreBadge } from '@/components/ui/MitreBadge'
import { getDetections, updateDetectionStatus } from '@/lib/api'
import { scoreColor, formatTs, relativeTime, cn, severityBg } from '@/lib/utils'
import type { Detection } from '@/types'
import { Filter, X } from 'lucide-react'

const SEL = 'bg-bg-hover border-l-2 border-l-accent'

export default function DetectionsPage() {
  const [severity, setSeverity] = useState('')
  const [status, setStatus] = useState('open')
  const [hours, setHours] = useState(24)
  const [selected, setSelected] = useState<Detection|null>(null)
  const qc = useQueryClient()

  const { data: detections = [], isLoading } = useQuery({
    queryKey: ['detections', severity, status, hours],
    queryFn: () => getDetections({ severity: severity||undefined, status: status||undefined, hours, limit: 500 }),
    refetchInterval: 20000,
  })

  const mut = useMutation({
    mutationFn: ({ id, s }: { id: number; s: string }) => updateDetectionStatus(id, s),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['detections'] }),
  })

  return (
    <Shell title="Threats">
      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-[11px] text-gray-500"><Filter className="w-3.5 h-3.5"/>FILTER</div>
          {[
            ['severity', severity, setSeverity, ['','critical','high','medium','low','info'], ['All Severities','Critical','High','Medium','Low','Info']],
            ['status', status, setStatus, ['','open','acknowledged','resolved','false_positive'], ['All Statuses','Open','Acknowledged','Resolved','False Positive']],
          ].map(([, val, setter, opts, labels]: any) => (
            <select key={String(opts[0])} value={val} onChange={e => setter(e.target.value)}
              className="bg-bg-card border border-border rounded-lg px-3 py-1.5 text-[12px] text-gray-300 focus:outline-none focus:border-accent/50">
              {opts.map((o: string, i: number) => <option key={o} value={o}>{labels[i]}</option>)}
            </select>
          ))}
          <select value={hours} onChange={e => setHours(Number(e.target.value))}
            className="bg-bg-card border border-border rounded-lg px-3 py-1.5 text-[12px] text-gray-300 focus:outline-none focus:border-accent/50">
            {[6,24,72,168].map(h => <option key={h} value={h}>Last {h}h</option>)}
          </select>
          <span className="ml-auto text-[12px] text-gray-500 font-mono">{detections.length} detections</span>
        </div>

        <div className="flex gap-4">
          {/* Table */}
          <div className="flex-1 min-w-0 bg-bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {['Severity','Detection','Host','MITRE','Score','Time','Status'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-gray-500">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-[12px] text-gray-600">Loading...</td></tr>
                ) : detections.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-16 text-center text-[12px] text-gray-600">No detections found — run inject_test_data.bat to simulate attacks</td></tr>
                ) : detections.map(d => (
                  <tr key={d.id} onClick={() => setSelected(selected?.id===d.id?null:d)}
                    className={cn('border-b border-border/50 cursor-pointer transition-colors', selected?.id===d.id ? SEL : 'hover:bg-bg-hover')}>
                    <td className="px-4 py-3"><SeverityBadge severity={d.severity}/></td>
                    <td className="px-4 py-3 max-w-xs"><p className="text-[13px] text-gray-200 truncate">{d.rule_name}</p></td>
                    <td className="px-4 py-3"><span className="text-[11px] font-mono text-gray-400">{d.hostname || d.agent_id.slice(0,12)}</span></td>
                    <td className="px-4 py-3">{d.mitre_technique_id && <MitreBadge id={d.mitre_technique_id}/>}</td>
                    <td className="px-4 py-3"><span className={`text-[12px] font-mono font-bold ${scoreColor(d.threat_score)}`}>{d.threat_score.toFixed(0)}</span></td>
                    <td className="px-4 py-3"><span className="text-[11px] text-gray-500">{relativeTime(d.timestamp)}</span></td>
                    <td className="px-4 py-3"><span className="text-[10px] font-mono text-gray-500 uppercase">{d.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="w-80 shrink-0 bg-bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-[12px] font-semibold text-gray-300">Detection Detail</span>
                <button onClick={() => setSelected(null)}><X className="w-4 h-4 text-gray-500 hover:text-gray-300"/></button>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto" style={{maxHeight:'70vh'}}>
                <div>
                  <SeverityBadge severity={selected.severity}/>
                  <h2 className="text-[14px] font-semibold text-white mt-2">{selected.rule_name}</h2>
                  <p className="text-[12px] text-gray-400 mt-1">{selected.description}</p>
                </div>
                <div className="space-y-2">
                  {[['Host', selected.hostname||selected.agent_id],['Score', `${selected.threat_score.toFixed(1)} / 100`],['Time', formatTs(selected.timestamp)],selected.incident_id?['Incident', `INC-${selected.incident_id}`]:null].filter(Boolean).map(([l,v]:any)=>(
                    <div key={l} className="flex justify-between gap-2">
                      <span className="text-[11px] text-gray-500">{l}</span>
                      <span className="text-[12px] font-mono text-gray-300 text-right">{v}</span>
                    </div>
                  ))}
                </div>
                {selected.mitre_technique_id && (
                  <div className="p-3 bg-bg-primary rounded-lg border border-border">
                    <p className="text-[10px] text-gray-500 mb-1.5">MITRE ATT&CK</p>
                    <MitreBadge id={selected.mitre_technique_id} name={selected.mitre_technique_name}/>
                    <p className="text-[11px] text-purple-400 mt-1">{selected.mitre_tactic}</p>
                    <p className="text-[12px] text-gray-300 mt-0.5">{selected.mitre_technique_name}</p>
                  </div>
                )}
                {Object.keys(selected.context).length > 0 && (
                  <div>
                    <p className="text-[10px] text-gray-500 mb-1.5">CONTEXT</p>
                    <div className="bg-bg-primary rounded-lg border border-border p-3 overflow-auto max-h-40">
                      <pre className="text-[10px] font-mono text-gray-400 whitespace-pre-wrap break-all">{JSON.stringify(selected.context,null,2)}</pre>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-gray-500 mb-2">UPDATE STATUS</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['acknowledged','resolved','false_positive'].map(s=>(
                      <button key={s} onClick={()=>mut.mutate({id:selected.id,s})} disabled={selected.status===s}
                        className={cn('px-2 py-1.5 text-[10px] font-mono rounded-lg border transition-colors',selected.status===s?'bg-accent/20 border-accent/40 text-accent':'border-border text-gray-500 hover:text-gray-200 hover:border-border-light disabled:opacity-30')}>
                        {s.replace('_',' ').toUpperCase()}
                      </button>
                    ))}
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
