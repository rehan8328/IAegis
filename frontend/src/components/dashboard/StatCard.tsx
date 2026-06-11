import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
export function StatCard({ label, value, trend, bad }: { label:string; value:string|number; trend?:number; bad?:boolean }) {
  const up = (trend ?? 0) >= 0
  return (
    <div className="bg-bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-border-light transition-colors">
      <p className="text-[12px] text-gray-400 font-medium">{label}</p>
      <span className="text-[30px] font-bold text-white tabular-nums leading-none">{typeof value==='number'?value.toLocaleString():value}</span>
      {trend !== undefined && (
        <div className="flex items-center gap-1.5">
          {up ? <TrendingUp className={cn('w-3.5 h-3.5', bad?'text-red-400':'text-accent')} /> : <TrendingDown className={cn('w-3.5 h-3.5', bad?'text-accent':'text-red-400')} />}
          <span className={cn('text-[12px] font-semibold', up?(bad?'text-red-400':'text-accent'):(bad?'text-accent':'text-red-400'))}>{up?'+':''}{trend}%</span>
          <span className="text-[11px] text-gray-500">vs last 24h</span>
        </div>
      )}
    </div>
  )
}
