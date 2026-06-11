'use client'
import { Shell } from '@/components/layout/Shell'
export default function Page() {
  return (
    <Shell title="IAEGIS">
      <div className="p-6">
        <div className="bg-bg-card border border-border rounded-xl flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-2xl">🔒</div>
          <p className="text-[14px] font-semibold text-white">Coming in Phase 2</p>
          <p className="text-[12px] text-gray-500">This module is under development</p>
        </div>
      </div>
    </Shell>
  )
}
