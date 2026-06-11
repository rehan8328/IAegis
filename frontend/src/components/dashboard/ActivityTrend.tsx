'use client'
import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function ActivityTrend({ data }: { data: Record<string, number> }) {
  const [range, setRange] = useState<'24h'|'7d'>('24h')
  const chartData = Object.entries(data).map(([time, events]) => ({ time, events }))
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end mb-2">
        <div className="flex gap-1 bg-bg-primary rounded-lg p-0.5 border border-border">
          {(['24h','7d'] as const).map(r=>(
            <button key={r} onClick={()=>setRange(r)} className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${range===r?'bg-bg-card text-white':'text-gray-500 hover:text-gray-300'}`}>{r}</button>
          ))}
        </div>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{top:4,right:4,bottom:0,left:-24}}>
            <defs>
              <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,55,72,0.5)" vertical={false}/>
            <XAxis dataKey="time" tick={{fontSize:10,fill:'#4b5563',fontFamily:'monospace'}} tickLine={false} axisLine={false} interval={3}/>
            <YAxis tick={{fontSize:10,fill:'#4b5563',fontFamily:'monospace'}} tickLine={false} axisLine={false}/>
            <Tooltip contentStyle={{background:'#1c2333',border:'1px solid #2d3748',borderRadius:8,fontSize:11,color:'#f0f6fc'}} labelStyle={{color:'#8b949e'}}/>
            <Area type="monotone" dataKey="events" stroke="#22c55e" strokeWidth={2} fill="url(#ag)" dot={false} activeDot={{r:4,fill:'#22c55e',stroke:'#0d1117',strokeWidth:2}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
