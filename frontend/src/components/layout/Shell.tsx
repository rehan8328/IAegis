'use client'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { WSProvider } from './WSProvider'
import { useAuth } from '@/lib/auth'

export function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4 6v6c0 5.25 3.4 10.15 8 11.36C16.6 22.15 20 17.25 20 12V6l-8-4z"/>
            </svg>
          </div>
          <p className="text-[13px] font-mono text-gray-500">IAEGIS Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <WSProvider>
      <div className="flex h-screen overflow-hidden bg-bg-primary">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header title={title} />
          <main className="flex-1 overflow-y-auto bg-bg-primary">{children}</main>
        </div>
      </div>
    </WSProvider>
  )
}
