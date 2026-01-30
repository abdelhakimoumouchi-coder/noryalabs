'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { Product, PaginationInfo, Category, Subcategory } from '@/types'

const inputCls = 'px-3 py-2 bg-card text-text placeholder:text-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent'
const selectCls = 'w-full px-3 py-2 bg-card text-text border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent'

function ShopContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    totalPages: 1,
    pageSize: 12,
    total: 0,
  })
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    subcategory: '',
    priceMin: '',
    priceMax: '',
    sort: 'createdAt',
  })

  useEffect(() => {
    const loadCats = async () => {
      const res = await fetch('/api/categories')
      if (res.ok) setCategories(await res.json())
    }
    loadCats()
  }, [])

  const loadSubcats = useCallback(async (categoryName?: string) => {
    const cat = categories.find((c) => c.name === categoryName)
    if (!cat) {
      setSubcategories([])
      return
    }
    const res = await fetch(`/api/subcategories?categoryId=${cat.id}`)
    if (res.ok) setSubcategories(await res.json())
  }, [categories])

  useEffect(() => {
    if (filters.category) loadSubcats(filters.category)
    else setSubcategories([])
  }, [filters.category, loadSubcats])

  const fetchProducts = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: '12',
        ...(filters.category && { category: filters.category }),
        ...(filters.subcategory && { subcategory: filters.subcategory }),
        ...(filters.priceMin && { priceMin: filters.priceMin }),
        ...(filters.priceMax && { priceMax: filters.priceMax }),
        sort: filters.sort,
      })

      const res = await fetch(`/api/products?${params}`, { signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      setProducts(data.products)
      setPagination(data.pagination)
    } catch (e: any) {
      if (e?.name === 'AbortError') return
      setError("Impossible de charger les produits.")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page])

  useEffect(() => {
    const controller = new AbortController()
    fetchProducts(controller.signal)
    return () => controller.abort()
  }, [fetchProducts])

  const resetFilters = () => {
    setFilters({ category: '', subcategory: '', priceMin: '', priceMax: '', sort: 'createdAt' })
    setPagination((p) => ({ ...p, page: 1 }))
    setSubcategories([])
  }

  const setFilterAndResetPage = (partial: Partial<typeof filters>) => {
    setFilters((f) => ({ ...f, ...partial }))
    setPagination((p) => ({ ...p, page: 1 }))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-bold mb-8">Notre Boutique</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-surface p-6 rounded-xl shadow-sm sticky top-24 border border-border">
            <h2 className="font-heading text-xl font-semibold mb-4">Filtres</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Catégorie</label>
              <select
                value={filters.category}
                onChange={(e) => {
                  const val = e.target.value
                  setFilterAndResetPage({ category: val, subcategory: '' })
                  const cat = categories.find((c) => c.name === val)
                  if (cat) loadSubcats(val)
                }}
                className={selectCls}
              >
                <option value="">Toutes</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Sous-catégorie</label>
              <select
                value={filters.subcategory}
                onChange={(e) => setFilterAndResetPage({ subcategory: e.target.value })}
                className={selectCls}
                disabled={!filters.category}
              >
                <option value="">Toutes</option>
                {subcategories.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Prix (DA)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin}
                  onChange={(e) => setFilterAndResetPage({ priceMin: e.target.value })}
                  className={inputCls}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax}
                  onChange={(e) => setFilterAndResetPage({ priceMax: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Trier par</label>
              <select
                value={filters.sort}
                onChange={(e) => setFilterAndResetPage({ sort: e.target.value })}
                className={selectCls}
              >
                <option value="createdAt">Nouveautés</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="name">Nom</option>
              </select>
            </div>

            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 text-sm text-accent border border-accent rounded-lg hover:bg-accent hover:text-background transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </aside>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-600">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {products.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted">Aucun produit trouvé</p>
                </div>
              )}

              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 text-text">
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-accent hover:text-accent transition"
                  >
                    Précédent
                  </button>
                  <span className="px-4 py-2">
                    Page {pagination.page} sur {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-accent hover:text-accent transition"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center text-text">Chargement...</div>
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  )
}