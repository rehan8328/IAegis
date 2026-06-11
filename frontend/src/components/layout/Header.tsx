'use client'
import { useState, useEffect, useCallback } from 'react'
import { Search, Bell, LogOut, RefreshCw, Wifi } from 'lucide-react'
import { useLiveStore } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { useQueryClient } from '@tanstack/react-query'

export function Header({ title }: { title: string }) {
  const { liveDetections } = useLiveStore()
  const { user, logout } = useAuth()
  const qc = useQueryClient()
  const criticals = liveDetections.filter(d => d.severity === 'critical' && d.status === 'open').length

  const [countdown, setCountdown] = useState(15)
  const [refreshing, setRefreshing] = useState(false)
  const [showUser, setShowUser] = useState(false)

  const doRefresh = useCallback(async () => {
    setRefreshing(true)
    await qc.invalidateQueries()
    setTimeout(() => setRefreshing(false), 800)
    setCountdown(15)
  }, [qc])

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { doRefresh(); return 15 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [doRefresh])

  return (
    <header className="h-14 bg-bg-secondary border-b border-border flex items-center justify-between px-6 shrink-0">
      <h1 className="text-[17px] font-semibold text-white">{title}</h1>

      <div className="flex items-center gap-3">

        {/* Live + auto-refresh */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[11px] font-mono text-accent">LIVE</span>
          <span className="text-[10px] text-gray-500 font-mono">|</span>
          <button onClick={doRefresh} className="flex items-center gap-1 text-[10px] font-mono text-gray-400 hover:text-accent transition-colors">
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin text-accent' : ''}`} />
            {refreshing ? 'Refreshing...' : `${countdown}s`}
          </button>
        </div>

        {/* Critical alerts badge */}
        {criticals > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/15 border border-red-500/30 animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-[11px] font-mono text-red-400 font-bold">{criticals} CRITICAL</span>
          </div>
        )}

        {/* Search */}
        <button className="w-8 h-8 rounded-lg bg-bg-card border border-border flex items-center justify-center text-gray-400 hover:text-white transition-colors">
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-lg bg-bg-card border border-border flex items-center justify-center text-gray-400 hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
          {criticals > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
              {criticals > 9 ? '9+' : criticals}
            </span>
          )}
        </button>

        {/* User avatar */}
        <div className="relative">
          <button
            onClick={() => setShowUser(!showUser)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-accent/20 border border-accent/30 hover:bg-accent/30 transition-colors">
            <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-white">
              {user?.avatar || 'SR'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[12px] font-medium text-white leading-none">{user?.name || 'Analyst'}</p>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5">{user?.role || 'SOC Analyst'}</p>
            </div>
          </button>

          {showUser && (
            <div className="absolute right-0 top-12 w-52 bg-bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-[13px] font-semibold text-white">{user?.name}</p>
                <p className="text-[11px] text-gray-400">{user?.email}</p>
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/15 border border-accent/25">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span className="text-[10px] font-mono text-accent">{user?.role}</span>
                </div>
              </div>
              <div className="p-2">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-red-400 hover:bg-red-500/10 transition-colors">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
