'use client'
import { useState } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, turnstileToken: token }),
    })
    if (res.ok) {
      window.location.href = '/admin/orders'
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data?.error ?? 'Erreur de connexion')
    }
  }

  return (
    <main className="min-h-screen bg-[#0b1220] px-4 py-10 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 bg-[#111827] border border-[#d4af37]/20 rounded-2xl p-5 sm:p-6 shadow-xl"
      >
        <div>
          <h1 className="text-2xl font-black text-[#d4af37] mb-1">Admin</h1>
          <p className="text-sm text-gray-400">Connexion au panel</p>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe admin"
          className="w-full border border-white/10 bg-[#0f172a] text-white px-4 py-3 rounded-xl outline-none focus:border-[#d4af37]"
        />

        <div className="overflow-x-auto">
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={(t) => setToken(t)}
            onExpire={() => setToken(null)}
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" className="w-full bg-[#d4af37] text-[#0b1220] font-bold py-3 rounded-xl">
          Se connecter
        </button>
      </form>
    </main>
  )
}
