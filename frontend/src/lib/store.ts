import { create } from 'zustand'
import type { TelemetryEvent, Detection, Incident } from '@/types'

interface LiveStore {
  liveEvents: TelemetryEvent[]; liveDetections: Detection[]; recentIncidents: Incident[]
  pushEvent:(e:TelemetryEvent)=>void; pushDetection:(d:Detection)=>void
  pushIncident:(i:Incident)=>void; updateIncident:(i:Partial<Incident>&{id:number})=>void
}

export const useLiveStore = create<LiveStore>((set) => ({
  liveEvents: [], liveDetections: [], recentIncidents: [],
  pushEvent: (e) => set(s => ({ liveEvents: [e, ...s.liveEvents].slice(0, 200) })),
  pushDetection: (d) => set(s => ({ liveDetections: [d, ...s.liveDetections].slice(0, 200) })),
  pushIncident: (i) => set(s => ({ recentIncidents: [i, ...s.recentIncidents.filter(x=>x.id!==i.id)].slice(0,50) })),
  updateIncident: (p) => set(s => ({ recentIncidents: s.recentIncidents.map(i=>i.id===p.id?{...i,...p}:i) })),
}))
