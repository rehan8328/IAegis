import { cn, severityBg } from '@/lib/utils'
export function SeverityBadge({ severity, className }: { severity: string; className?: string }) {
  return <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase', severityBg(severity), className)}>{severity}</span>
}
