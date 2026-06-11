'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Activity, AlertTriangle, Bell, Server, FileText, Shield, Settings, Crosshair } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'

const NAV = [
  { href: '/',           label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/telemetry',  label: 'Monitoring', icon: Activity },
  { href: '/detections', label: 'Threats',    icon: AlertTriangle },
  { href: '/respond',    label: 'Respond',    icon: Crosshair },
  { href: '/alerts',     label: 'Alerts',     icon: Bell },
  { href: '/agents',     label: 'Assets',     icon: Server },
  { href: '/incidents',  label: 'Incidents',  icon: Shield },
  { href: '/reports',    label: 'Reports',    icon: FileText },
]

export function Sidebar() {
  const path = usePathname()
  const { user } = useAuth()

  return (
    <aside className="flex flex-col w-52 min-h-screen bg-bg-secondary border-r border-border shrink-0">

      {/* Brand */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(34,197,94,0.1))', border: '1px solid rgba(34,197,94,0.4)', boxShadow: '0 0 20px rgba(34,197,94,0.15)' }}>
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="text-[16px] font-bold text-white">IAEGIS</div>
            <div className="text-[9px] font-mono text-accent/70 tracking-widest">SANDH SECURITY</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== '/' && path.startsWith(href))
          return (
            <Link key={href} href={href} className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150',
              active
                ? 'bg-accent text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200 hover:bg-bg-hover'
            )} style={active ? { boxShadow: '0 4px 15px rgba(34,197,94,0.25)' } : {}}>
              <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-white' : 'text-gray-500')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User info at bottom */}
      <div className="px-3 pb-4 border-t border-border pt-3 space-y-1">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-gray-500 hover:text-gray-300 hover:bg-bg-hover transition-colors">
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[11px] font-bold text-white shrink-0">
              {user.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-gray-300 truncate">{user.name}</p>
              <p className="text-[10px] text-gray-600 truncate">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
