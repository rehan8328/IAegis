'use client'
import { useLiveStore } from '@/lib/store'
import { severityBg, severityDot, relativeTime } from '@/lib/utils'

export function RecentAlerts() {
  const { liveDetections } = useLiveStore()
  const alerts = liveDetections.slice(0, 6)
  if (!alerts.length) return (
    <div className="flex flex-col items-center justify-center h-36 gap-2">
      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-lg">✓</div>
      <p className="text-[12px] text-gray-500">No alerts yet — run inject_test_data.bat</p>
    </div>
  )
  return (
    <table className="w-full">
      <thead><tr className="border-b border-border">
        {['Type','Source','Severity','Time'].map(h=><th key={h} className="pb-2 text-left text-[11px] font-medium text-gray-500">{h}</th>)}
      </tr></thead>
      <tbody className="divide-y divide-border/40">
        {alerts.map(a=>(
          <tr key={a.id} className="hover:bg-bg-hover/50 transition-colors">
            <td className="py-2.5 pr-3">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${severityDot(a.severity)}`}/>
                <span className="text-[12px] text-gray-200 truncate max-w-[160px]">{a.rule_name}</span>
              </div>
            </td>
            <td className="py-2.5 pr-3"><span className="text-[11px] font-mono text-gray-400">{a.hostname || a.agent_id?.slice(0,12) || '—'}</span></td>
            <td className="py-2.5 pr-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${severityBg(a.severity)}`}>{a.severity}</span></td>
            <td className="py-2.5"><span className="text-[11px] text-gray-500 whitespace-nowrap">{relativeTime(a.timestamp)}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
