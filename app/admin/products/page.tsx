'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Folder, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/products')
      .then(r => r.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [refreshKey]);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;

    await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
    });

    setRefreshKey(k => k + 1);
  };

  return (
    <div>

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <h1 className="text-3xl font-black text-white">Produits</h1>

        <div className="flex flex-wrap gap-3">

          <button
            onClick={() => router.push('/admin')}
            className="border border-[#d4af37]/30 text-[#d4af37] px-4 py-2 rounded-xl hover:bg-[#d4af37]/10 transition flex items-center gap-2 text-sm"
          >
            <LayoutDashboard size={14} />
            Dashboard
          </button>

          <button
            onClick={() => router.push('/admin/categories')}
            className="border border-[#d4af37]/30 text-[#d4af37] px-4 py-2 rounded-xl hover:bg-[#d4af37]/10 transition flex items-center gap-2 text-sm"
          >
            <Folder size={14} />
            Catégories
          </button>

          <button
            onClick={() => router.push('/admin/products/create')}
            className="bg-[#d4af37] text-[#0b1220] font-bold px-5 py-2.5 rounded-xl hover:bg-[#c9a42f] transition flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            Nouveau produit
          </button>

        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-[#d4af37]">
          Chargement...
        </div>
      ) : (
        <div className="bg-[#111827] border border-[#d4af37]/20 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0f172a]">
                <tr className="text-gray-400">
                  <th className="text-left px-4 py-3">Produit</th>
                  <th className="text-left px-4 py-3">Catégorie</th>
                  <th className="text-left px-4 py-3">Prix</th>
                  <th className="text-left px-4 py-3">Stock</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-t border-white/5 hover:bg-[#1f2937] transition"
                  >
                    <td className="px-4 py-3 flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#0f172a]">
                        <img
                          src={product.images?.[0] || '/placeholder.jpg'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = '/placeholder.jpg';
                          }}
                        />
                      </div>
                      <span className="text-white">{product.name}</span>
                      {product.isFeatured && (
                        <span className="ml-2 text-xs bg-[#d4af37] text-black px-2 py-1 rounded">
                          En avant
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-gray-400">
                      {product.category || '-'}
                    </td>

                    <td className="px-4 py-3 text-[#d4af37] font-semibold">
                      {product.priceDa?.toLocaleString('fr-DZ')} DA
                    </td>

                    <td className="px-4 py-3">
                      <span className={product.stock > 0 ? 'text-green-400' : 'text-red-400'}>
                        {product.stock}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                        className="p-2 text-gray-400 hover:text-[#d4af37] transition"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              Aucun produit trouvé
            </div>
          )}
        </div>
      )}
    </div>
  );
}
