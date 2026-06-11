'use client'
import { useEffect, useRef, useCallback } from 'react'
import type { WSMessage } from '@/types'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'

export function useWebSocket(onMessage: (msg: WSMessage) => void) {
  const ws = useRef<WebSocket | null>(null)
  const timer = useRef<NodeJS.Timeout | null>(null)
  const handler = useRef(onMessage)
  handler.current = onMessage

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return
    const socket = new WebSocket(`${WS_URL}/ws`)
    socket.onopen = () => console.log('[WS] Connected')
    socket.onmessage = (e) => { try { handler.current(JSON.parse(e.data)) } catch {} }
    socket.onclose = () => { timer.current = setTimeout(connect, 3000) }
    socket.onerror = () => socket.close()
    ws.current = socket
  }, [])

  useEffect(() => {
    connect()
    return () => { timer.current && clearTimeout(timer.current); ws.current?.close() }
  }, [connect])
}
