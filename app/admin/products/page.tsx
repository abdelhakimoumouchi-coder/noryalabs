'use client'

import { useEffect, useState } from 'react'
import { Product, Category } from '@/types'

export default function AdminProductsPage() {
  const [adminSecret, setAdminSecret] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    priceDa: '',
    category: '',
    description: '',
    images: '',
    benefits: '',
    characteristics: '',
    stock: '',
    isFeatured: false,
  })
  const [catForm, setCatForm] = useState({ name: '', order: '' })

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/products', { headers: { 'x-admin-secret': adminSecret } })
      if (res.ok) setProducts(await res.json())
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    const res = await fetch('/api/admin/categories', { headers: { 'x-admin-secret': adminSecret } })
    if (res.ok) setCategories(await res.json())
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setAuthenticated(true)
    fetchProducts()
    fetchCategories()
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
      colors: form.characteristics ? form.characteristics.split(',').map(s => s.trim()).filter(Boolean) : undefined,
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
        characteristics: '',
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

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
      body: JSON.stringify({ name: catForm.name, order: Number(catForm.order || '0') }),
    })
    if (res.ok) {
      setCatForm({ name: '', order: '' })
      fetchCategories()
    } else alert('Erreur catégorie')
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Supprimer cette catégorie ?')) return
    const res = await fetch('/api/admin/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
      body: JSON.stringify({ id }),
    })
    if (res.ok) fetchCategories()
    else alert('Erreur suppression catégorie')
  }

  const handleRenameCategory = async (id: string, name: string) => {
    const res = await fetch('/api/admin/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
      body: JSON.stringify({ id, name }),
    })
    if (res.ok) fetchCategories()
    else alert('Erreur renommage catégorie')
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
        <button onClick={() => { fetchProducts(); fetchCategories() }} className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-sage transition-colors">
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

          <select
            required
            className="w-full px-4 py-3 border rounded-lg"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Choisir une catégorie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

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

          <input
            placeholder="Caractéristiques (séparées par des virgules)"
            className="w-full px-4 py-3 border rounded-lg"
            value={form.characteristics}
            onChange={(e) => setForm({ ...form, characteristics: e.target.value })}
          />
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

        <div className="bg-surface p-6 rounded-xl shadow-sm space-y-6">
          <div>
            <h2 className="font-heading text-xl font-semibold mb-3">Produits</h2>
            {loading ? (
              <div>Chargement...</div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {products.map((p) => (
                  <div key={p.id} className="border rounded-lg p-4 flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-sm text-gray-600">{p.category}</div>
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

          <div className="border-t pt-4">
            <h2 className="font-heading text-xl font-semibold mb-3">Catégories</h2>
            <form onSubmit={handleAddCategory} className="space-y-2 mb-4">
              <input
                required
                placeholder="Nom de la catégorie"
                className="w-full px-3 py-2 border rounded-lg"
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              />
              <input
                type="number"
                placeholder="Ordre (optionnel)"
                className="w-full px-3 py-2 border rounded-lg"
                value={catForm.order}
                onChange={(e) => setCatForm({ ...catForm, order: e.target.value })}
              />
              <button className="w-full bg-olive text-white py-2 rounded-lg hover:bg-sage transition-colors">Ajouter</button>
            </form>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                  <div className="flex-1">
                    <input
                      className="w-full bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-olive text-sm"
                      value={c.name}
                      onChange={(e) => handleRenameCategory(c.id, e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(c.id)}
                    className="ml-3 text-red-600 text-sm hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
              {categories.length === 0 && <div className="text-sm text-gray-500">Aucune catégorie</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}