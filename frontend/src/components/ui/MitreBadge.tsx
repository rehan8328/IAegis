export function MitreBadge({ id, name }: { id: string; name?: string | null }) {
  return <span title={name||id} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">{id}</span>
}
