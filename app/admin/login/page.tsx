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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto py-12">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe admin"
        className="w-full border px-3 py-2 rounded"
      />
      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={(t) => setToken(t)}
        onExpire={() => setToken(null)}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" className="w-full bg-black text-white py-2 rounded">
        Se connecter
      </button>
    </form>
  )
}