import { cn } from '@/lib/utils'
export function Panel({ title, actions, children, className, bodyClass }: { title?:string; actions?:React.ReactNode; children:React.ReactNode; className?:string; bodyClass?:string }) {
  return (
    <div className={cn('bg-bg-card border border-border rounded-xl overflow-hidden shadow-lg shadow-black/20', className)}>
      {(title||actions) && <div className="flex items-center justify-between px-4 py-3 border-b border-border">{title && <span className="text-[12px] font-semibold text-gray-300">{title}</span>}{actions && <div className="flex items-center gap-2">{actions}</div>}</div>}
      <div className={cn('', bodyClass)}>{children}</div>
    </div>
  )
}
