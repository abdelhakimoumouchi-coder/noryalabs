'use client'

import { useEffect, useMemo, useState } from 'react'
import { Product, Category, Subcategory } from '@/types'
import { formatPrice } from '@/lib/utils'

const inputCls = 'w-full px-3 py-2 rounded-lg border border-border bg-card text-text focus:outline-none focus:ring-2 focus:ring-accent'

const emptyForm = {
  name: '',
  priceDa: '',
  category: '',
  subcategoryId: '',
  description: '',
  images: '',
  benefits: '',
  characteristics: '',
  stock: '',
  isFeatured: false,
  slug: '',
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [catForm, setCatForm] = useState({ name: '', order: '' })
  const [subcatForm, setSubcatForm] = useState({ name: '', order: '', categoryId: '' })

  // Modal édition
  const [modalProduct, setModalProduct] = useState<Product | null>(null)
  const [modalForm, setModalForm] = useState(emptyForm)
  const [modalSaving, setModalSaving] = useState(false)

  const handleUnauthorized = () => {
    window.location.href = '/admin/login'
  }

  const fetchProducts = async () => {
    const res = await fetch('/api/admin/products')
    if (res.status === 401) return handleUnauthorized()
    if (res.ok) setProducts(await res.json())
  }

  const fetchCategories = async () => {
    const res = await fetch('/api/admin/categories')
    if (res.status === 401) return handleUnauthorized()
    if (res.ok) setCategories(await res.json())
  }

  const fetchSubcategories = async (categoryId?: string) => {
    const params = categoryId ? `?categoryId=${categoryId}` : ''
    const res = await fetch(`/api/admin/subcategories${params}`)
    if (res.status === 401) return handleUnauthorized()
    if (res.ok) setSubcategories(await res.json())
  }

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([fetchProducts(), fetchCategories(), fetchSubcategories()])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (form.category) {
      const cat = categories.find((c) => c.name === form.category)
      if (cat) fetchSubcategories(cat.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.category, categories])

  const handleUpload = async (files: FileList) => {
    const fd = new FormData()
    Array.from(files).forEach(f => fd.append('files', f))
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    if (res.status === 401) return handleUnauthorized()
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name: form.name,
      priceDa: Number(form.priceDa),
      category: form.category || 'general',
      subcategoryId: form.subcategoryId || undefined,
      description: form.description,
      images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
      benefits: form.benefits ? form.benefits.split('\n').map(s => s.trim()).filter(Boolean) : undefined,
      colors: form.characteristics ? form.characteristics.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      stock: Number(form.stock || '0'),
      isFeatured: !!form.isFeatured,
      slug: form.slug || undefined,
    }

    const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products'
    const method = editingId ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.status === 401) return handleUnauthorized()
    if (res.ok) {
      setForm(emptyForm)
      setEditingId(null)
      fetchProducts()
    } else {
      alert(editingId ? 'Erreur mise à jour produit' : 'Erreur création produit')
    }
  }

  const handleUpdateStock = async (id: string, stock: number) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock }),
    })
    if (res.status === 401) return handleUnauthorized()
    if (res.ok) fetchProducts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (res.status === 401) return handleUnauthorized()
    if (res.ok) fetchProducts()
  }

  // Pré-remplir formulaire principal
  const handleEdit = (p: Product) => {
    setEditingId(p.id)
    setForm({
      name: p.name || '',
      priceDa: String(p.priceDa ?? ''),
      category: p.category || '',
      subcategoryId: p.subcategoryId ?? '',
      description: p.description || '',
      images: Array.isArray(p.images) ? p.images.join('\n') : '',
      benefits: Array.isArray(p.benefits) ? p.benefits.join('\n') : '',
      characteristics: Array.isArray((p as any).colors) ? (p as any).colors.join(', ') : '',
      stock: String(p.stock ?? ''),
      isFeatured: !!p.isFeatured,
      slug: p.slug || '',
    })
  }

  // Modal édition
  const openEditModal = (p: Product) => {
    setModalProduct(p)
    setModalForm({
      name: p.name || '',
      priceDa: String(p.priceDa ?? ''),
      category: p.category || '',
      subcategoryId: p.subcategoryId ?? '',
      description: p.description || '',
      images: Array.isArray(p.images) ? p.images.join('\n') : '',
      benefits: Array.isArray(p.benefits) ? p.benefits.join('\n') : '',
      characteristics: Array.isArray((p as any).colors) ? (p as any).colors.join(', ') : '',
      stock: String(p.stock ?? ''),
      isFeatured: !!p.isFeatured,
      slug: p.slug || '',
    })
  }

  const closeEditModal = () => {
    setModalProduct(null)
    setModalForm(emptyForm)
    setModalSaving(false)
  }

  const handleModalSave = async () => {
    if (!modalProduct) return
    setModalSaving(true)
    const payload = {
      name: modalForm.name,
      priceDa: Number(modalForm.priceDa),
      category: modalForm.category || 'general',
      subcategoryId: modalForm.subcategoryId || undefined,
      description: modalForm.description,
      images: modalForm.images.split('\n').map(s => s.trim()).filter(Boolean),
      benefits: modalForm.benefits ? modalForm.benefits.split('\n').map(s => s.trim()).filter(Boolean) : undefined,
      colors: modalForm.characteristics ? modalForm.characteristics.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      stock: Number(modalForm.stock || '0'),
      isFeatured: !!modalForm.isFeatured,
      slug: modalForm.slug || undefined,
    }
    const res = await fetch(`/api/admin/products/${modalProduct.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.status === 401) return handleUnauthorized()
    if (res.ok) {
      await fetchProducts()
      closeEditModal()
    } else {
      alert('Erreur mise à jour produit')
      setModalSaving(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: catForm.name, order: Number(catForm.order || '0') }),
    })
    if (res.status === 401) return handleUnauthorized()
    if (res.ok) {
      setCatForm({ name: '', order: '' })
      fetchCategories()
    } else {
      alert('Erreur création catégorie')
    }
  }

  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/subcategories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: subcatForm.name,
        order: Number(subcatForm.order || '0'),
        categoryId: subcatForm.categoryId,
      }),
    })
    if (res.status === 401) return handleUnauthorized()
    if (res.ok) {
      setSubcatForm({ name: '', order: '', categoryId: '' })
      fetchSubcategories(subcatForm.categoryId)
    } else {
      alert('Erreur création sous-catégorie')
    }
  }

  const subcatsForSelectedCategory = useMemo(() => {
    if (!form.category) return subcategories
    const cat = categories.find(c => c.name === form.category)
    if (!cat) return subcategories
    return subcategories.filter(sc => sc.categoryId === cat.id)
  }, [form.category, categories, subcategories])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-3xl font-bold mb-6">Admin - Produits</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleSave} className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h2 className="font-heading text-xl font-semibold">Créer / éditer un produit</h2>
          <input className={inputCls} placeholder="Nom" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className={inputCls} placeholder="Slug (optionnel)" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
          <input className={inputCls} type="number" placeholder="Prix (DA)" value={form.priceDa} onChange={e => setForm({ ...form, priceDa: e.target.value })} />

          <select
            className={inputCls}
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value, subcategoryId: '' })}
          >
            <option value="">Choisir une catégorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <select
            className={inputCls}
            value={form.subcategoryId}
            onChange={e => setForm({ ...form, subcategoryId: e.target.value })}
          >
            <option value="">Sous-catégorie (optionnel)</option>
            {subcatsForSelectedCategory.map(sc => (
              <option key={sc.id} value={sc.id}>{sc.name}</option>
            ))}
          </select>

          <textarea className={inputCls} placeholder="Description" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <textarea className={inputCls} placeholder="Images (1 URL par ligne)" rows={3} value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} />
          <textarea className={inputCls} placeholder="Bénéfices (1 par ligne)" rows={3} value={form.benefits} onChange={e => setForm({ ...form, benefits: e.target.value })} />
          <input className={inputCls} placeholder="Couleurs (séparées par des virgules)" value={form.characteristics} onChange={e => setForm({ ...form, characteristics: e.target.value })} />
          <input className={inputCls} type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} />
            Mettre en avant
          </label>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Upload images</label>
            <input type="file" multiple onChange={(e) => e.target.files && handleUpload(e.target.files)} />
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="w-full bg-accent text-background py-3 rounded-lg font-semibold hover:bg-accentDark transition-colors">
              {editingId ? 'Mettre à jour' : 'Enregistrer'}
            </button>
            {editingId && (
              <button
                type="button"
                className="text-sm text-muted underline"
                onClick={() => { setForm(emptyForm); setEditingId(null) }}
              >
                Annuler
              </button>
            )}
          </div>
        </form>

        <div className="space-y-6">
          <form onSubmit={handleCreateCategory} className="bg-surface p-4 rounded-xl border border-border shadow-sm space-y-3">
            <h2 className="font-heading text-lg font-semibold">Catégories</h2>
            <input className={inputCls} placeholder="Nom" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} />
            <input className={inputCls} type="number" placeholder="Ordre" value={catForm.order} onChange={e => setCatForm({ ...catForm, order: e.target.value })} />
            <button type="submit" className="w-full bg-card border border-border py-2 rounded-lg hover:border-accent">
              Ajouter catégorie
            </button>
            <ul className="text-sm text-muted space-y-1">
              {categories.map(c => <li key={c.id}>{c.order} — {c.name}</li>)}
            </ul>
          </form>

          <form onSubmit={handleCreateSubcategory} className="bg-surface p-4 rounded-xl border border-border shadow-sm space-y-3">
            <h2 className="font-heading text-lg font-semibold">Sous-catégories</h2>
            <select className={inputCls} value={subcatForm.categoryId} onChange={e => setSubcatForm({ ...subcatForm, categoryId: e.target.value })}>
              <option value="">Catégorie</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className={inputCls} placeholder="Nom" value={subcatForm.name} onChange={e => setSubcatForm({ ...subcatForm, name: e.target.value })} />
            <input className={inputCls} type="number" placeholder="Ordre" value={subcatForm.order} onChange={e => setSubcatForm({ ...subcatForm, order: e.target.value })} />
            <button type="submit" className="w-full bg-card border border-border py-2 rounded-lg hover:border-accent">
              Ajouter sous-catégorie
            </button>
            <ul className="text-sm text-muted space-y-1">
              {subcategories.map(sc => <li key={sc.id}>{sc.order} — {sc.name}</li>)}
            </ul>
          </form>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-heading text-2xl font-semibold mb-4">Produits</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {products.map((p) => (
            <div key={p.id} className="bg-surface p-4 rounded-xl border border-border shadow-sm">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="text-sm text-muted uppercase tracking-wide">{p.category}</p>
                  <h3 className="font-heading text-lg font-semibold text-text">{p.name}</h3>
                  <p className="text-accent font-bold">{formatPrice(p.priceDa)}</p>
                  <p className="text-xs text-muted mt-1">Slug: {p.slug}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={() => openEditModal(p)}
                    className="text-sm text-accent hover:text-accentDark"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <input
                  type="number"
                  className="w-24 px-3 py-2 rounded-lg border border-border bg-card text-text focus:outline-none focus:ring-2 focus:ring-accent"
                  defaultValue={p.stock}
                  onBlur={(e) => handleUpdateStock(p.id, Number(e.target.value || '0'))}
                />
                <span className="text-sm text-muted">Stock</span>
              </div>

              {p.subcategory && (
                <p className="text-xs text-muted mt-2">Sous-catégorie : {p.subcategory.name}</p>
              )}

              <div className="mt-3 text-xs text-muted space-y-1">
                {(p.images || []).slice(0, 3).map((img, idx) => (
                  <div key={idx} className="truncate">{img}</div>
                ))}
                {(p.images || []).length > 3 && <div>…</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-2xl bg-surface border border-border rounded-xl shadow-xl p-6 relative">
            <button
              className="absolute top-3 right-3 text-sm text-muted hover:text-text"
              onClick={closeEditModal}
            >
              ✕
            </button>
            <h3 className="font-heading text-xl font-semibold mb-4">Modifier : {modalProduct.name}</h3>
            <div className="grid gap-3">
              <input className={inputCls} placeholder="Nom" value={modalForm.name} onChange={e => setModalForm({ ...modalForm, name: e.target.value })} />
              <input className={inputCls} placeholder="Slug (optionnel)" value={modalForm.slug} onChange={e => setModalForm({ ...modalForm, slug: e.target.value })} />
              <input className={inputCls} type="number" placeholder="Prix (DA)" value={modalForm.priceDa} onChange={e => setModalForm({ ...modalForm, priceDa: e.target.value })} />
              <input className={inputCls} placeholder="Catégorie" value={modalForm.category} onChange={e => setModalForm({ ...modalForm, category: e.target.value })} />
              <input className={inputCls} placeholder="Sous-catégorie ID" value={modalForm.subcategoryId} onChange={e => setModalForm({ ...modalForm, subcategoryId: e.target.value })} />
              <textarea className={inputCls} placeholder="Description" rows={3} value={modalForm.description} onChange={e => setModalForm({ ...modalForm, description: e.target.value })} />
              <textarea className={inputCls} placeholder="Images (1 URL par ligne)" rows={3} value={modalForm.images} onChange={e => setModalForm({ ...modalForm, images: e.target.value })} />
              <textarea className={inputCls} placeholder="Bénéfices (1 par ligne)" rows={3} value={modalForm.benefits} onChange={e => setModalForm({ ...modalForm, benefits: e.target.value })} />
              <input className={inputCls} placeholder="Couleurs (séparées par des virgules)" value={modalForm.characteristics} onChange={e => setModalForm({ ...modalForm, characteristics: e.target.value })} />
              <input className={inputCls} type="number" placeholder="Stock" value={modalForm.stock} onChange={e => setModalForm({ ...modalForm, stock: e.target.value })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={modalForm.isFeatured} onChange={e => setModalForm({ ...modalForm, isFeatured: e.target.checked })} />
                Mettre en avant
              </label>
            </div>
            <div className="mt-4 flex gap-3 justify-end">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 rounded-lg border border-border text-text hover:border-accent"
              >
                Annuler
              </button>
              <button
                onClick={handleModalSave}
                disabled={modalSaving}
                className="px-4 py-2 rounded-lg bg-accent text-background font-semibold hover:bg-accentDark disabled:opacity-60"
              >
                {modalSaving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
