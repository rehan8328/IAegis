'use client'
import { useQuery } from '@tanstack/react-query'
import { Shell } from '@/components/layout/Shell'
import { StatCard } from '@/components/dashboard/StatCard'
import { ThreatMap } from '@/components/dashboard/ThreatMap'
import { ThreatCategories } from '@/components/dashboard/ThreatCategories'
import { ActivityTrend } from '@/components/dashboard/ActivityTrend'
import { RecentAlerts } from '@/components/dashboard/RecentAlerts'
import { getDashboardStats } from '@/lib/api'

export default function DashboardPage() {
  const { data: stats } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats, refetchInterval: 15000 })

  return (
    <Shell title="Overview">
      <div className="p-6 space-y-5">

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Total Events"     value={stats?.total_events_24h ?? 0}      trend={18.6} />
          <StatCard label="Threats Detected" value={stats?.total_detections_24h ?? 0}  trend={12.4} bad />
          <StatCard label="Critical Alerts"  value={stats?.critical_detections ?? 0}   trend={8.3}  bad />
          <StatCard label="Active Assets"    value={stats?.total_agents ?? 0}           trend={6.7} />
        </div>

        {/* Map + Categories */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-semibold text-white">Threat Map</h2>
              <span className="text-[11px] text-gray-500 font-mono">LIVE</span>
            </div>
            <div className="h-56"><ThreatMap /></div>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <h2 className="text-[14px] font-semibold text-white mb-3">Threat Categories</h2>
            <ThreatCategories total={stats?.total_detections_24h ?? 0} bySeverity={stats?.detections_by_severity ?? {}} />
          </div>
        </div>

        {/* Alerts + Trend */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-semibold text-white">Recent Alerts</h2>
              <a href="/detections" className="text-[11px] text-accent hover:underline">View all →</a>
            </div>
            <RecentAlerts />
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <h2 className="text-[14px] font-semibold text-white mb-1">Activity Trend</h2>
            <div className="h-52"><ActivityTrend data={stats?.hourly_event_volume ?? {}} /></div>
          </div>
        </div>

        {/* MITRE table */}
        {(stats?.top_mitre_techniques?.length ?? 0) > 0 && (
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <h2 className="text-[14px] font-semibold text-white mb-3">Top MITRE ATT&CK Techniques</h2>
            <div className="grid grid-cols-2 gap-3">
              {stats!.top_mitre_techniques.slice(0,8).map(t=>(
                <div key={t.technique_id} className="flex items-center gap-3 p-2 rounded-lg bg-bg-primary">
                  <span className="text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1.5 py-0.5 rounded shrink-0">{t.technique_id}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-300 truncate">{t.technique_name}</p>
                    <div className="mt-1 h-1 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{width:`${Math.min((t.count/(stats!.top_mitre_techniques[0].count))*100,100)}%`}}/>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-gray-500 shrink-0">{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </Shell>
  )
}
