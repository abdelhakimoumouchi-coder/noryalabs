'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  order: number;
  subcats?: Subcategory[];
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);

  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // ─────────────────────────────
  // Fetch categories WITH subcats
  // ─────────────────────────────
  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(data => {
        setCategories(Array.isArray(data) ? data : data.categories || []);
        setLoading(false);
      });
  }, [refreshKey]);

  // ─────────────────────────────
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Supprimer cette catégorie ?')) return;

    await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    });

    setRefreshKey(k => k + 1);
  };

  const handleDeleteSub = async (id: string) => {
    if (!confirm('Supprimer cette sous-catégorie ?')) return;

    await fetch(`/api/admin/subcategories/${id}`, {
      method: 'DELETE',
    });

    setRefreshKey(k => k + 1);
  };

  // ─────────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-white">
          Catégories & Sous-catégories
        </h1>

        <button
          onClick={() => {
            setEditCategory(null);
            setShowCategoryModal(true);
          }}
          className="bg-[#d4af37] text-black font-bold px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={16} />
          Nouvelle catégorie
        </button>
      </div>

      {loading ? (
        <div className="text-center text-[#d4af37] py-10">
          Chargement...
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="bg-[#111827] border border-white/10 rounded-2xl p-6"
            >
              {/* Header catégorie */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-white font-bold text-lg">
                    {cat.name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    Ordre: {cat.order}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setShowSubModal(true);
                    }}
                    className="px-3 py-1 text-xs bg-[#d4af37] text-black rounded-lg"
                  >
                    + Sous-catégorie
                  </button>

                  <button
                    onClick={() => {
                      setEditCategory(cat);
                      setShowCategoryModal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-[#d4af37]"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-2 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Subcategories */}
              <div className="pl-4 border-l border-white/10 space-y-2">
                {cat.subcats && cat.subcats.length > 0 ? (
                  cat.subcats.map(sub => (
                    <div
                      key={sub.id}
                      className="flex justify-between items-center text-sm text-gray-300"
                    >
                      <span>• {sub.name}</span>
                      <button
                        onClick={() => handleDeleteSub(sub.id)}
                        className="text-red-400 hover:text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">
                    Aucune sous-catégorie
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCategoryModal && (
        <CategoryModal
          category={editCategory}
          onClose={() => setShowCategoryModal(false)}
          onSave={() => {
            setShowCategoryModal(false);
            setRefreshKey(k => k + 1);
          }}
        />
      )}

      {showSubModal && selectedCategoryId && (
        <SubcategoryModal
          categoryId={selectedCategoryId}
          onClose={() => setShowSubModal(false)}
          onSave={() => {
            setShowSubModal(false);
            setRefreshKey(k => k + 1);
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────
// CATEGORY MODAL
// ─────────────────────────────
function CategoryModal({ category, onClose, onSave }: any) {
  const [name, setName] = useState(category?.name || '');
  const [order, setOrder] = useState(category?.order?.toString() || '0');

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const payload = { name, order: parseInt(order) };

    const url = category
      ? `/api/admin/categories/${category.id}`
      : '/api/admin/categories';

    const method = category ? 'PATCH' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    onSave();
  };

  return (
    <Modal title={category ? 'Modifier catégorie' : 'Nouvelle catégorie'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          required
          placeholder="Nom"
          className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-2 text-white"
        />

        <input
          type="number"
          value={order}
          onChange={e => setOrder(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-2 text-white"
        />

        <button className="w-full bg-[#d4af37] text-black font-bold py-2 rounded-xl">
          Sauvegarder
        </button>
      </form>
    </Modal>
  );
}

// ─────────────────────────────
// SUBCATEGORY MODAL
// ─────────────────────────────
function SubcategoryModal({ categoryId, onClose, onSave }: any) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);

    const res = await fetch('/api/admin/subcategories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, categoryId }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Erreur création');
      return;
    }

    onSave();
  };

  return (
    <Modal title="Nouvelle sous-catégorie" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          required
          placeholder="Nom sous-catégorie"
          className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-2 text-white"
        />

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button className="w-full bg-[#d4af37] text-black font-bold py-2 rounded-xl">
          Sauvegarder
        </button>
      </form>
    </Modal>
  );
}

// ─────────────────────────────
// MODAL WRAPPER
// ─────────────────────────────
function Modal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-white font-bold mb-4">{title}</h2>
        {children}
        <button
          onClick={onClose}
          className="mt-4 w-full border border-white/20 text-gray-400 py-2 rounded-xl"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}