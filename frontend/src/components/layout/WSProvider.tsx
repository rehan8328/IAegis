'use client'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useLiveStore } from '@/lib/store'
import type { WSMessage, TelemetryEvent, Detection, Incident } from '@/types'

export function WSProvider({ children }: { children: React.ReactNode }) {
  const { pushEvent, pushDetection, pushIncident, updateIncident } = useLiveStore()
  useWebSocket((msg: WSMessage) => {
    switch (msg.type) {
      case 'telemetry_event':  pushEvent(msg.payload as TelemetryEvent); break
      case 'detection':        pushDetection(msg.payload as Detection);  break
      case 'incident_created': pushIncident(msg.payload as Incident);    break
      case 'incident_updated': updateIncident(msg.payload as any);       break
    }
  })
  return <>{children}</>
}
