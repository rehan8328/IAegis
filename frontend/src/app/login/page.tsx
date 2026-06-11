'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Shield, Eye, EyeOff, AlertCircle, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('admin@iaegis.com')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 800)) // simulate auth
    const ok = login(email, password)
    if (!ok) {
      setError('Invalid credentials. Try admin@iaegis.com / iaegis2024')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 50% 50%, #0d2818 0%, #0d1117 60%)' }}>

      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#22c55e" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 border border-accent/40 mb-4"
            style={{ boxShadow: '0 0 40px rgba(34,197,94,0.2)' }}>
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-[28px] font-bold text-white tracking-wide">IAEGIS</h1>
          <p className="text-[13px] text-gray-400 mt-1">Cyber Defense Platform</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] font-mono text-accent">SANDH SECURITY SYSTEMS</span>
          </div>
        </div>

        {/* Login card */}
        <div className="bg-bg-card border border-border rounded-2xl p-8 shadow-2xl"
          style={{ boxShadow: '0 0 60px rgba(0,0,0,0.5), 0 0 30px rgba(34,197,94,0.05)' }}>

          <h2 className="text-[17px] font-semibold text-white mb-1">Sign in to SOC Console</h2>
          <p className="text-[12px] text-gray-500 mb-6">Enter your credentials to access the platform</p>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label className="text-[11px] font-medium text-gray-400 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="analyst@iaegis.com"
                  required
                  className="w-full bg-bg-primary border border-border rounded-xl pl-10 pr-4 py-3 text-[13px] text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-accent/60 focus:bg-bg-primary transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[11px] font-medium text-gray-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-bg-primary border border-border rounded-xl pl-10 pr-12 py-3 text-[13px] text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-accent/60 transition-colors"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-[12px] text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-[14px] hover:bg-accent-dark transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{ boxShadow: loading ? 'none' : '0 0 20px rgba(34,197,94,0.3)' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Authenticating...
                </span>
              ) : 'Access SOC Console'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-5 p-3 bg-bg-primary border border-border/50 rounded-xl">
            <p className="text-[10px] font-mono text-gray-600 mb-1">DEMO CREDENTIALS</p>
            <p className="text-[11px] font-mono text-gray-400">admin@iaegis.com / iaegis2024</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-600 mt-5 font-mono">
          IAEGIS v1.0 — SANDH SECURITY SYSTEMS © 2026
        </p>
      </div>
    </div>
  )
}
