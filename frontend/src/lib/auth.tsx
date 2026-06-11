'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AuthUser {
  name: string
  email: string
  role: string
  avatar: string
}

interface AuthCtx {
  user: AuthUser | null
  login: (email: string, password: string) => boolean
  logout: () => void
  isLoading: boolean
}

// Demo credentials — replace with real auth in production
const USERS: Record<string, { password: string; user: AuthUser }> = {
  'admin@iaegis.com': {
    password: 'iaegis2024',
    user: { name: 'Sandh Rehan', email: 'admin@iaegis.com', role: 'SOC Analyst', avatar: 'SR' }
  },
  'analyst@iaegis.com': {
    password: 'analyst123',
    user: { name: 'Security Analyst', email: 'analyst@iaegis.com', role: 'Analyst', avatar: 'SA' }
  },
}

const AuthContext = createContext<AuthCtx>({
  user: null, login: () => false, logout: () => {}, isLoading: true
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    try {
      const stored = localStorage.getItem('iaegis_user')
      if (stored) setUser(JSON.parse(stored))
    } catch {}
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/login') {
      router.push('/login')
    }
    if (!isLoading && user && pathname === '/login') {
      router.push('/')
    }
  }, [user, isLoading, pathname])

  const login = (email: string, password: string): boolean => {
    const match = USERS[email.toLowerCase()]
    if (match && match.password === password) {
      setUser(match.user)
      localStorage.setItem('iaegis_user', JSON.stringify(match.user))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('iaegis_user')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
