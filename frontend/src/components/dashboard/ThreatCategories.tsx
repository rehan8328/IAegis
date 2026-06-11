'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const DEMO = [
  {name:'Malware',color:'#22c55e',value:40},{name:'Phishing',color:'#3b82f6',value:25},
  {name:'Intrusion',color:'#f97316',value:20},{name:'Ransomware',color:'#a855f7',value:10},{name:'Other',color:'#6b7280',value:5},
]
const SEV_COLORS: Record<string,string> = { critical:'#ef4444', high:'#f97316', medium:'#eab308', low:'#22c55e', info:'#6b7280' }

export function ThreatCategories({ total, bySeverity={} }: { total:number; bySeverity?:Record<string,number> }) {
  const hasReal = Object.values(bySeverity).some(v=>v>0) && total > 0
  const data = hasReal
    ? Object.entries(bySeverity).filter(([,v])=>v>0).map(([k,v])=>({name:k.charAt(0).toUpperCase()+k.slice(1),color:SEV_COLORS[k]||'#6b7280',value:v}))
    : DEMO
  const displayTotal = total > 0 ? total : 0
  return (
    <div className="flex flex-col h-full">
      <div className="relative flex items-center justify-center" style={{height:160}}>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={72} dataKey="value" strokeWidth={0} paddingAngle={2}>
              {data.map((e,i)=><Cell key={i} fill={e.color}/>)}
            </Pie>
            <Tooltip contentStyle={{background:'#1c2333',border:'1px solid #2d3748',borderRadius:8,fontSize:11,color:'#f0f6fc'}}/>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute flex flex-col items-center pointer-events-none">
          <span className="text-[24px] font-bold text-white tabular-nums">{displayTotal}</span>
          <span className="text-[10px] text-gray-500">Total</span>
        </div>
      </div>
      <div className="space-y-2 mt-2">
        {data.map((item,i)=>(
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full shrink-0" style={{background:item.color}}/><span className="text-[12px] text-gray-400">{item.name}</span></div>
            <span className="text-[12px] font-semibold text-white tabular-nums">
              {hasReal ? `${Math.round((item.value/displayTotal)*100)}%` : `${item.value}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
