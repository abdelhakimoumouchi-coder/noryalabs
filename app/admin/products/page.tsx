'use client'

import { useState } from 'react'
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

  // Ajout : mise à jour manuelle du stock
  const handleUpdateStock = async (id: string, newStock: number) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
      body: JSON.stringify({ stock: newStock }),
    })
    if (res.ok) {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p)))
    } else {
      alert('Erreur mise à jour stock')
    }
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

  const inputCls = "w-full px-4 py-3 bg-card text-text placeholder:text-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
  const selectCls = "w-full px-4 py-3 bg-card text-text border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-surface p-8 rounded-xl shadow-lg max-w-md w-full border border-border">
          <h1 className="font-heading text-2xl font-bold mb-6 text-center">Admin - Produits</h1>
          <form onSubmit={handleLogin}>
            <label className="block text-sm font-medium mb-2">Secret Admin</label>
            <input
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              className={`${inputCls} mb-4`}
              placeholder="Entrez le secret admin"
            />
            <button type="submit" className="w-full bg-accent text-background py-3 rounded-lg font-semibold hover:bg-accentDark transition-colors">
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
        <button onClick={() => { fetchProducts(); fetchCategories() }} className="px-4 py-2 bg-accent text-background rounded-lg hover:bg-accentDark transition-colors">
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <form onSubmit={handleCreate} className="bg-surface p-6 rounded-xl shadow-sm space-y-4 border border-border">
          <h2 className="font-heading text-xl font-semibold">Ajouter / Mettre à jour</h2>
          <input required placeholder="Nom" className={inputCls}
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required type="number" placeholder="Prix (DA)" className={inputCls}
            value={form.priceDa} onChange={(e) => setForm({ ...form, priceDa: e.target.value })} />
          <select
            required
            className={selectCls}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Choisir une catégorie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <textarea required placeholder="Description" className={inputCls}
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Images (upload ou collez une URL par ligne)</label>
            <input
              type="file"
              accept="image/png,image/jpeg"
              multiple
              onChange={(e) => {
                if (!e.target.files?.length) return
                void handleUpload(e.target.files)
              }}
              className="text-text text-sm"
            />
            <textarea
              placeholder="Une URL ou /uploads/... par ligne"
              className={inputCls}
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
            />
          </div>

          <textarea placeholder="Bénéfices (une ligne par bénéfice)" className={inputCls}
            value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} />

          <input
            placeholder="Caractéristiques (séparées par des virgules)"
            className={inputCls}
            value={form.characteristics}
            onChange={(e) => setForm({ ...form, characteristics: e.target.value })}
          />
          <input type="number" placeholder="Stock" className={inputCls}
            value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-text">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
            Mettre en avant
          </label>
          <button type="submit" className="w-full bg-accent text-background py-3 rounded-lg font-semibold hover:bg-accentDark transition-colors">
            Enregistrer
          </button>
        </form>

        <div className="bg-surface p-6 rounded-xl shadow-sm space-y-6 border border-border">
          <div>
            <h2 className="font-heading text-xl font-semibold mb-3">Produits</h2>
            {loading ? (
              <div className="text-muted">Chargement...</div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {products.map((p) => (
                  <div key={p.id} className="border border-border rounded-lg p-4 flex justify-between items-start bg-card">
                    <div>
                      <div className="font-semibold text-text">{p.name}</div>
                      <div className="text-sm text-muted">{p.category}</div>
                      <div className="text-sm text-text">Stock: {p.stock}</div>
                    </div>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-400 text-sm">
                      Supprimer
                    </button>
                    {/* Champ de mise à jour stock */}
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-sm text-text">MAJ stock:</span>
                      <input
                        type="number"
                        className="w-20 px-2 py-1 bg-background text-text border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
                        value={p.stock}
                        onChange={(e) => handleUpdateStock(p.id, Number(e.target.value || 0))}
                      />
                    </div>
                  </div>
                ))}
                {products.length === 0 && <div className="text-sm text-muted">Aucun produit</div>}
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4">
            <h2 className="font-heading text-xl font-semibold mb-3">Catégories</h2>
            <form onSubmit={handleAddCategory} className="space-y-2 mb-4">
              <input
                required
                placeholder="Nom de la catégorie"
                className={inputCls}
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              />
              <input
                type="number"
                placeholder="Ordre (optionnel)"
                className={inputCls}
                value={catForm.order}
                onChange={(e) => setCatForm({ ...catForm, order: e.target.value })}
              />
              <button className="w-full bg-accent text-background py-2 rounded-lg hover:bg-accentDark transition-colors">Ajouter</button>
            </form>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between border border-border rounded-lg px-3 py-2 bg-card">
                  <div className="flex-1">
                    <input
                      className="w-full bg-transparent border-b border-dashed border-border focus:outline-none focus:border-accent text-sm text-text"
                      value={c.name}
                      onChange={(e) => handleRenameCategory(c.id, e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(c.id)}
                    className="ml-3 text-red-500 text-sm hover:text-red-400"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
              {categories.length === 0 && <div className="text-sm text-muted">Aucune catégorie</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}