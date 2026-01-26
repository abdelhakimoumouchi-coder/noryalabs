'use client'

import { useState } from 'react'
import { Product } from '@/types'

export default function AdminProductsPage() {
  const [adminSecret, setAdminSecret] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    priceDa: '',
    category: '',
    description: '',
    images: '',
    benefits: '',
    colors: '',
    stock: '',
    isFeatured: false,
  })

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/products', { headers: { 'x-admin-secret': adminSecret } })
      if (res.ok) setProducts(await res.json())
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setAuthenticated(true)
    fetchProducts()
  }

  const handleUpload = async (files: FileList) => {
    const fd = new FormData()
    Array.from(files).forEach(f => fd.append('files', f))
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'x-admin-secret': adminSecret },
      body: fd,
    })
    if (res.ok) {
      const data = await res.json() as { urls: string[] }
      setForm(prev => ({
        ...prev,
        images: [...prev.images.split('\n').filter(Boolean), ...data.urls].join('\n'),
      }))
    } else {
      alert('Erreur upload')
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name: form.name,
      priceDa: Number(form.priceDa),
      category: form.category || 'general',
      description: form.description,
      images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
      benefits: form.benefits ? form.benefits.split('\n').map(s => s.trim()).filter(Boolean) : undefined,
      colors: form.colors ? form.colors.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      stock: Number(form.stock || '0'),
      isFeatured: !!form.isFeatured,
    }
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setForm({
        name: '',
        priceDa: '',
        category: '',
        description: '',
        images: '',
        benefits: '',
        colors: '',
        stock: '',
        isFeatured: false,
      })
      fetchProducts()
    } else {
      alert('Erreur création produit')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE', headers: { 'x-admin-secret': adminSecret } })
    if (res.ok) fetchProducts()
    else alert('Erreur suppression')
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-surface p-8 rounded-xl shadow-lg max-w-md w-full">
          <h1 className="font-heading text-2xl font-bold mb-6 text-center">Admin - Produits</h1>
          <form onSubmit={handleLogin}>
            <label className="block text-sm font-medium mb-2">Secret Admin</label>
            <input
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive mb-4"
              placeholder="Entrez le secret admin"
            />
            <button type="submit" className="w-full bg-olive text-white py-3 rounded-lg font-semibold hover:bg-sage transition-colors">
              Se connecter
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading text-3xl font-bold">Gestion des Produits</h1>
        <button onClick={fetchProducts} className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-sage transition-colors">
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <form onSubmit={handleCreate} className="bg-surface p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="font-heading text-xl font-semibold">Ajouter / Mettre à jour</h2>
          <input required placeholder="Nom" className="w-full px-4 py-3 border rounded-lg"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required type="number" placeholder="Prix (DA)" className="w-full px-4 py-3 border rounded-lg"
            value={form.priceDa} onChange={(e) => setForm({ ...form, priceDa: e.target.value })} />
          <input placeholder="Catégorie" className="w-full px-4 py-3 border rounded-lg"
            value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <textarea required placeholder="Description" className="w-full px-4 py-3 border rounded-lg"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <div className="space-y-2">
            <label className="text-sm font-medium">Images (upload ou collez une URL par ligne)</label>
            <input
              type="file"
              accept="image/png,image/jpeg"
              multiple
              onChange={(e) => {
                if (!e.target.files?.length) return
                void handleUpload(e.target.files)
              }}
              className="w-full"
            />
            <textarea
              placeholder="Une URL ou /uploads/... par ligne"
              className="w-full px-4 py-3 border rounded-lg"
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
            />
          </div>

          <textarea placeholder="Bénéfices (une ligne par bénéfice)" className="w-full px-4 py-3 border rounded-lg"
            value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} />

          <input placeholder="Couleurs (séparées par des virgules)" className="w-full px-4 py-3 border rounded-lg"
            value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} />
          <input type="number" placeholder="Stock" className="w-full px-4 py-3 border rounded-lg"
            value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
            Mettre en avant
          </label>
          <button type="submit" className="w-full bg-olive text-white py-3 rounded-lg font-semibold hover:bg-sage transition-colors">
            Enregistrer
          </button>
        </form>

        <div className="bg-surface p-6 rounded-xl shadow-sm">
          <h2 className="font-heading text-xl font-semibold mb-4">Produits</h2>
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto">
              {products.map((p) => (
                <div key={p.id} className="border rounded-lg p-4 flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-sm text-gray-600">{p.category}</div>
                    <div className="text-sm">{p.colors?.join(', ')}</div>
                    <div className="text-sm">Stock: {p.stock}</div>
                  </div>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline text-sm">
                    Supprimer
                  </button>
                </div>
              ))}
              {products.length === 0 && <div className="text-sm text-gray-500">Aucun produit</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}