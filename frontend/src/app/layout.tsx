import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'IAEGIS — Cyber Defense Platform',
  description: 'AI-native endpoint detection and response',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body><Providers>{children}</Providers></body>
    </html>
  )
}
