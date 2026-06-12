'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Filter, X } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { Product, PaginationInfo, Category, Subcategory } from '@/types'

const inputCls = 'px-3 py-2 bg-card text-text placeholder:text-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent'
const selectCls = 'w-full px-3 py-2 bg-card text-text border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent'

export default function ShopClient({
  initialProducts,
  initialCategories,
  initialPagination,
  initialCategory = '',
  initialGender = '',
  initialBrand = '',
  initialInStock = false,
}: {
  initialProducts: Product[]
  initialCategories: Category[]
  initialPagination: PaginationInfo
  initialCategory?: string
  initialGender?: string
  initialBrand?: string
  initialInStock?: boolean
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const firstFetch = useRef(true)
  const [pagination, setPagination] = useState<PaginationInfo>(initialPagination)
  const [filters, setFilters] = useState({
    gender: initialGender,
    category: initialCategory,
    subcategory: '',
    brand: initialBrand,
    color: '',
    priceMin: '',
    priceMax: '',
    promotion: false,
    inStock: initialInStock,
    sort: 'createdAt',
  })

  useEffect(() => {
    if (categories.length > 0) return
    const loadCats = async () => {
      const res = await fetch('/api/categories')
      if (res.ok) setCategories(await res.json())
    }
    loadCats()
  }, [categories.length])

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
        ...(filters.gender && { gender: filters.gender }),
        ...(filters.category && { category: filters.category }),
        ...(filters.subcategory && { subcategory: filters.subcategory }),
        ...(filters.brand && { brand: filters.brand }),
        ...(filters.priceMin && { priceMin: filters.priceMin }),
        ...(filters.priceMax && { priceMax: filters.priceMax }),
        ...(filters.promotion && { promotion: 'true' }),
        ...(filters.inStock && { inStock: 'true' }),
        sort: filters.sort,
      })

      const res = await fetch(`/api/products?${params}`, { signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      setProducts(data.products)
      setPagination(data.pagination)
    } catch (e: any) {
      if (e?.name === 'AbortError') return
      setError('Impossible de charger les produits.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page])

  useEffect(() => {
    if (firstFetch.current) {
      firstFetch.current = false
      return
    }
    const controller = new AbortController()
    fetchProducts(controller.signal)
    return () => controller.abort()
  }, [fetchProducts])

  const resetFilters = () => {
    setFilters({ gender: '', category: '', subcategory: '', brand: '', color: '', priceMin: '', priceMax: '', promotion: false, inStock: false, sort: 'createdAt' })
    setPagination((p) => ({ ...p, page: 1 }))
    setSubcategories([])
  }

  const setFilterAndResetPage = (partial: Partial<typeof filters>) => {
    setFilters((f) => ({ ...f, ...partial }))
    setPagination((p) => ({ ...p, page: 1 }))
  }

  const activeFiltersCount = [
    filters.category,
    filters.gender,
    filters.subcategory,
    filters.brand,
    filters.color,
    filters.priceMin,
    filters.priceMax,
    filters.promotion ? 'promotion' : '',
    filters.inStock ? 'stock' : '',
  ].filter(Boolean).length

  const colorOptions = Array.from(
    new Map(
      products
        .flatMap((product) => product.colors || [])
        .map((color) => [color.name, color])
    ).values()
  )

  const displayProducts = filters.color
    ? products.filter((product) => product.colors?.some((color) => color.name === filters.color))
    : products

  const categoryIntro = filters.category
    ? `Explorez notre sélection ${filters.category.toLowerCase()} pensée pour les clients qui recherchent une montre premium en Algérie. Chaque modèle est présenté avec ses informations essentielles, son prix en dinars et ses images pour faciliter votre choix. Store DZ privilégie les montres originales, une livraison nationale dans les 58 wilayas et le paiement à la livraison.`
    : 'Découvrez nos montres premium originales en Algérie. Filtrez la collection et ouvrez une fiche produit pour voir les détails, couleurs, prix et disponibilité.'

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold">
          {filters.category || 'Boutique de montres premium en Algérie'}
        </h1>
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-background font-semibold shadow-sm"
          aria-expanded={filtersOpen}
        >
          {filtersOpen ? <X size={16} /> : <Filter size={16} />}
          Filtres{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
        </button>
      </div>

      <p className="max-w-3xl text-sm sm:text-base text-muted mb-6 sm:mb-8">{categoryIntro}</p>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {[
          { value: '', label: 'Tous' },
          { value: 'homme', label: 'Homme' },
          { value: 'femme', label: 'Femme' },
          { value: 'unisexe', label: 'Unisexe' },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setFilterAndResetPage({ gender: item.value, category: '', subcategory: '' })}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              filters.gender === item.value
                ? 'border-accent bg-accent text-background'
                : 'border-border bg-surface text-text hover:border-accent'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 lg:gap-8">
        {filtersOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setFiltersOpen(false)}
            aria-label="Fermer les filtres"
          />
        )}
        <aside className={`${filtersOpen ? 'fixed inset-x-3 top-20 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto' : 'hidden'} lg:static lg:block lg:col-span-1`}>
          <div className="bg-surface p-5 sm:p-6 rounded-xl shadow-sm sticky top-24 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-semibold">Filtres</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="lg:hidden text-muted hover:text-text"
                aria-label="Fermer les filtres"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Marque ou modèle</label>
              <input
                type="search"
                placeholder="Casio, Tissot..."
                value={filters.brand}
                onChange={(e) => setFilterAndResetPage({ brand: e.target.value })}
                className={`${inputCls} w-full`}
              />
            </div>

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

            {colorOptions.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Couleur</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFilterAndResetPage({ color: '' })}
                    className={`rounded-full border px-3 py-1.5 text-xs ${!filters.color ? 'border-accent bg-accent text-background' : 'border-border text-text'}`}
                  >
                    Toutes
                  </button>
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setFilterAndResetPage({ color: color.name })}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${
                        filters.color === color.name ? 'border-accent bg-accent text-background' : 'border-border text-text'
                      }`}
                    >
                      <span className="h-3.5 w-3.5 rounded-full border border-white/30" style={{ backgroundColor: color.hex || '#C6A15B' }} />
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="mb-6 flex items-center gap-3 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={filters.promotion}
                onChange={(e) => setFilterAndResetPage({ promotion: e.target.checked })}
                className="h-4 w-4 accent-olive"
              />
              Produits en promotion
            </label>

            <label className="mb-6 flex items-center gap-3 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => setFilterAndResetPage({ inStock: e.target.checked })}
                className="h-4 w-4 accent-accent"
              />
              En stock uniquement
            </label>

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
              onClick={() => {
                resetFilters()
                setFiltersOpen(false)
              }}
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
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-8">
                {displayProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {displayProducts.length === 0 && (
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

      {!filters.category && (
        <section className="mt-12 rounded-xl border border-border bg-surface p-5 sm:p-7 text-sm sm:text-base text-muted space-y-4 leading-7">
          <h2 className="font-heading text-2xl font-bold text-text">Bien choisir votre montre Store DZ</h2>
          <p>
            Découvrez la boutique Store DZ et notre collection de montres homme et femme premium en Algérie. Les
            modèles sont sélectionnés pour leur élégance, leur fiabilité et leur usage quotidien ou occasionnel. Vous
            pouvez filtrer par catégorie, prix et nouveautés, puis commander simplement avec livraison dans les 58
            wilayas, paiement à la livraison et garantie 2 ans.
          </p>
          <p>
            Store DZ vous aide à choisir une montre premium selon votre style et votre besoin : montre homme pour un
            look professionnel ou sport-chic, montre femme raffinée pour le quotidien ou une soirée, et modèles
            élégants à offrir en cadeau. Les fiches produits indiquent le prix, la disponibilité et les images pour
            faciliter votre décision.
          </p>
          <p>
            Notre boutique de montres en Algérie met l’accent sur des produits originaux, une commande simple, une
            livraison nationale et un service client disponible. Vous pouvez parcourir toute la collection et affiner
            votre choix avec les filtres homme, femme, couleur, marque, prix et disponibilité.
          </p>
        </section>
      )}
    </div>
  )
}
