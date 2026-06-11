'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shell } from '@/components/layout/Shell'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { MitreBadge } from '@/components/ui/MitreBadge'
import { getDetections, getIncidents, updateDetectionStatus, updateIncident } from '@/lib/api'
import { scoreColor, relativeTime, cn } from '@/lib/utils'
import type { Detection, Incident } from '@/types'
import { Crosshair, Shield, AlertTriangle, CheckCircle, XCircle, Eye, Zap, Target, Clock, TrendingUp } from 'lucide-react'

const RESPONSE_ACTIONS = [
  { id: 'acknowledge', label: 'Acknowledge', icon: Eye, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20', status: 'acknowledged' },
  { id: 'contain',    label: 'Contain',     icon: Shield, color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20', status: 'acknowledged' },
  { id: 'resolve',    label: 'Resolve',     icon: CheckCircle, color: 'text-green-400 border-green-500/30 bg-green-500/10 hover:bg-green-500/20', status: 'resolved' },
  { id: 'dismiss',    label: 'False Positive', icon: XCircle, color: 'text-gray-400 border-gray-500/30 bg-gray-500/10 hover:bg-gray-500/20', status: 'false_positive' },
]

export default function RespondPage() {
  const qc = useQueryClient()
  const [actioned, setActioned] = useState<Set<number>>(new Set())

  const { data: detections = [] } = useQuery({
    queryKey: ['respond-detections'],
    queryFn: () => getDetections({ status: 'open', hours: 24, limit: 50 }),
    refetchInterval: 10000,
  })

  const { data: incidents = [] } = useQuery({
    queryKey: ['respond-incidents'],
    queryFn: () => getIncidents({ status: 'open', limit: 20 }),
    refetchInterval: 10000,
  })

  const detMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateDetectionStatus(id, status),
    onSuccess: (_, { id }) => {
      setActioned(s => new Set([...s, id]))
      qc.invalidateQueries({ queryKey: ['respond-detections'] })
    },
  })

  const incMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateIncident(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['respond-incidents'] }),
  })

  const critical = detections.filter(d => d.severity === 'critical')
  const high = detections.filter(d => d.severity === 'high')
  const openInc = incidents.filter(i => i.status === 'open')

  return (
    <Shell title="Threat Response">
      <div className="p-6 space-y-5">

        {/* Status bar */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Active Threats',    value: detections.length, icon: Target,        color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
            { label: 'Critical',          value: critical.length,   icon: Zap,           color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
            { label: 'High Severity',     value: high.length,       icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
            { label: 'Open Incidents',    value: openInc.length,    icon: Shield,        color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={cn('border rounded-xl p-4 flex items-center gap-4', bg)}>
              <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center', bg)}>
                <Icon className={cn('w-5 h-5', color)} />
              </div>
              <div>
                <p className="text-[11px] text-gray-500">{label}</p>
                <p className={cn('text-[24px] font-bold tabular-nums', color)}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-5">

          {/* Active threat queue */}
          <div className="col-span-2 bg-bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-red-400" />
                <span className="text-[13px] font-semibold text-white">Active Threat Queue</span>
              </div>
              <span className="text-[11px] font-mono text-gray-500">{detections.length} open</span>
            </div>

            <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto">
              {detections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-accent" />
                  </div>
                  <p className="text-[13px] text-gray-400 font-medium">All clear — no active threats</p>
                  <p className="text-[11px] text-gray-600">Run inject_test_data.bat to simulate attacks</p>
                </div>
              ) : (
                detections.map(det => (
                  <div key={det.id} className={cn(
                    'px-5 py-4 transition-all',
                    actioned.has(det.id) ? 'opacity-40' : 'hover:bg-bg-hover'
                  )}>
                    <div className="flex items-start gap-3">
                      <SeverityBadge severity={det.severity} className="mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[13px] font-semibold text-white">{det.rule_name}</p>
                          <span className={`text-[11px] font-mono font-bold ${scoreColor(det.threat_score)}`}>
                            {det.threat_score.toFixed(0)}/100
                          </span>
                          {det.mitre_technique_id && <MitreBadge id={det.mitre_technique_id} />}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">{det.description}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-mono text-gray-600">{det.hostname || det.agent_id?.slice(0, 14)}</span>
                          <Clock className="w-3 h-3 text-gray-700" />
                          <span className="text-[10px] text-gray-600">{relativeTime(det.timestamp)}</span>
                          {det.incident_id && (
                            <span className="text-[10px] font-mono text-blue-400">INC-{det.incident_id}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Response actions */}
                    {!actioned.has(det.id) && (
                      <div className="flex items-center gap-2 mt-3 ml-0">
                        {RESPONSE_ACTIONS.map(action => (
                          <button
                            key={action.id}
                            onClick={() => detMut.mutate({ id: det.id, status: action.status })}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all',
                              action.color
                            )}>
                            <action.icon className="w-3 h-3" />
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                    {actioned.has(det.id) && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <CheckCircle className="w-3.5 h-3.5 text-accent" />
                        <span className="text-[11px] text-accent font-mono">Action taken</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Incident response panel */}
          <div className="space-y-4">
            <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <Shield className="w-4 h-4 text-yellow-400" />
                <span className="text-[13px] font-semibold text-white">Open Incidents</span>
              </div>
              <div className="divide-y divide-border/50 max-h-80 overflow-y-auto">
                {openInc.length === 0 ? (
                  <div className="py-8 text-center text-[12px] text-gray-600">No open incidents</div>
                ) : openInc.map(inc => (
                  <div key={inc.id} className="px-4 py-3 hover:bg-bg-hover transition-colors">
                    <div className="flex items-start gap-2 mb-2">
                      <SeverityBadge severity={inc.severity} className="shrink-0 mt-0.5" />
                      <p className="text-[12px] text-gray-200 leading-snug">{inc.title}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-mono font-bold ${scoreColor(inc.threat_score)}`}>
                        Score {inc.threat_score.toFixed(0)}
                      </span>
                      <span className="text-gray-700">·</span>
                      <span className="text-[10px] text-gray-500">{relativeTime(inc.created_at)}</span>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      <button onClick={() => incMut.mutate({ id: inc.id, status: 'investigating' })}
                        className="px-2 py-1 rounded-lg border border-blue-500/30 bg-blue-500/10 text-[10px] font-mono text-blue-400 hover:bg-blue-500/20 transition-colors">
                        Investigate
                      </button>
                      <button onClick={() => incMut.mutate({ id: inc.id, status: 'contained' })}
                        className="px-2 py-1 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-[10px] font-mono text-yellow-400 hover:bg-yellow-500/20 transition-colors">
                        Contain
                      </button>
                      <button onClick={() => incMut.mutate({ id: inc.id, status: 'resolved' })}
                        className="px-2 py-1 rounded-lg border border-green-500/30 bg-green-500/10 text-[10px] font-mono text-green-400 hover:bg-green-500/20 transition-colors">
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Response guide */}
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <p className="text-[12px] font-semibold text-white mb-3">Response Playbook</p>
              <div className="space-y-2.5">
                {[
                  { step: '1', label: 'Acknowledge', desc: 'Confirm threat is real', color: 'bg-blue-500' },
                  { step: '2', label: 'Investigate', desc: 'Check telemetry context', color: 'bg-purple-500' },
                  { step: '3', label: 'Contain',     desc: 'Isolate affected host', color: 'bg-yellow-500' },
                  { step: '4', label: 'Resolve',     desc: 'Remediate and close',   color: 'bg-accent' },
                ].map(s => (
                  <div key={s.step} className="flex items-start gap-3">
                    <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5', s.color)}>
                      {s.step}
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-gray-300">{s.label}</p>
                      <p className="text-[10px] text-gray-600">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}
