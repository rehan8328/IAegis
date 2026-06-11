'use client'
import { useEffect, useState } from 'react'

const DOTS = [
  { x:15, y:22, i:'high' },{ x:22, y:38, i:'medium' },{ x:47, y:18, i:'high' },
  { x:52, y:28, i:'medium' },{ x:55, y:20, i:'low' },{ x:62, y:20, i:'high' },
  { x:68, y:30, i:'medium' },{ x:72, y:22, i:'high' },{ x:78, y:18, i:'critical' },
  { x:82, y:25, i:'high' },{ x:55, y:40, i:'low' },{ x:82, y:42, i:'medium' },
  { x:85, y:22, i:'critical' },{ x:74, y:30, i:'high' },{ x:12, y:30, i:'low' },
]
const C: Record<string,string> = { critical:'#ef4444', high:'#f97316', medium:'#eab308', low:'#22c55e' }
const S: Record<string,number> = { critical:5, high:4, medium:3.5, low:3 }

export function ThreatMap() {
  const [active, setActive] = useState<number[]>([])
  useEffect(() => {
    const t = setInterval(() => {
      const n = 2 + Math.floor(Math.random()*3), ids: number[] = []
      while(ids.length < n) { const i = Math.floor(Math.random()*DOTS.length); if(!ids.includes(i)) ids.push(i) }
      setActive(ids)
    }, 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="relative w-full h-full bg-[#060c18] rounded-lg overflow-hidden">
      <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="mg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34,197,94,0.05)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="0.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect width="100" height="50" fill="url(#mg)" />
        {[10,20,30,40,50,60,70,80,90].map(x=><line key={x} x1={x} y1={0} x2={x} y2={50} stroke="rgba(34,197,94,0.05)" strokeWidth="0.2"/>)}
        {[10,20,30,40].map(y=><line key={y} x1={0} y1={y} x2={100} y2={y} stroke="rgba(34,197,94,0.05)" strokeWidth="0.2"/>)}
        <path d="M5,15 C8,12 12,10 18,12 L22,14 C25,13 28,14 30,17 L28,22 C26,25 22,28 18,28 L14,26 C10,24 7,20 5,15Z M18,32 C20,30 23,30 25,32 L26,36 C25,40 23,44 21,45 L18,44 C16,41 16,37 18,32Z M43,10 C46,8 50,9 52,11 L54,14 C53,17 50,20 48,21 L45,20 C43,17 43,13 43,10Z M44,22 C47,20 51,21 54,23 L55,26 C54,30 51,33 49,34 L46,33 C44,30 43,26 44,22Z M55,8 C60,6 68,7 74,10 L80,13 C84,16 86,20 84,24 L80,27 C76,30 70,31 64,29 L58,25 C54,21 54,14 55,8Z M72,28 C76,27 80,28 82,31 L83,35 C82,38 79,40 76,40 L73,39 C71,37 70,33 72,28Z M78,38 C81,36 85,37 87,40 L87,43 C86,46 83,47 80,46 L78,43 C76,41 76,39 78,38Z" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.25)" strokeWidth="0.3" strokeLinejoin="round"/>
        {active.map(i=>{const d=DOTS[i];return(<line key={`l${i}`} x1={d.x} y1={d.y} x2={50} y2={25} stroke={C[d.i]} strokeWidth="0.15" strokeDasharray="0.5 0.5" opacity="0.4"/>)})}
        {DOTS.map((d,i)=>{const col=C[d.i],sz=S[d.i],isA=active.includes(i);return(
          <g key={i} transform={`translate(${d.x},${d.y})`} filter="url(#glow)">
            {isA&&<><circle r={sz} fill="none" stroke={col} strokeWidth="0.3" opacity="0.6"><animate attributeName="r" from={sz*0.5} to={sz*2.5} dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" from="0.7" to="0" dur="1.8s" repeatCount="indefinite"/></circle><circle r={sz*0.7} fill="none" stroke={col} strokeWidth="0.3" opacity="0.4"><animate attributeName="r" from={sz*0.3} to={sz*1.8} dur="1.8s" begin="0.4s" repeatCount="indefinite"/><animate attributeName="opacity" from="0.5" to="0" dur="1.8s" begin="0.4s" repeatCount="indefinite"/></circle></>}
            <circle r={sz*0.45} fill={col}/>
          </g>
        )})}
        <g transform="translate(50,25)">
          <circle r="2" fill="none" stroke="#22c55e" strokeWidth="0.4"><animate attributeName="r" values="1.5;3;1.5" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite"/></circle>
          <circle r="0.8" fill="#22c55e"/>
        </g>
      </svg>
      <div className="absolute bottom-2 left-3 flex items-center gap-3">
        {[['Critical','#ef4444'],['High','#f97316'],['Medium','#eab308'],['Low','#22c55e']].map(([l,c])=>(
          <div key={l} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{background:c}}/>
            <span className="text-[9px] text-gray-600">{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
