'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, X } from 'lucide-react';

export default function CreateProduct() {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [filteredSubcats, setFilteredSubcats] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ MULTI IMAGES via URL
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategoryId: '',
    description: '',
    priceDa: '',
    stock: '0',
    colors: '',
    featured: false,
  });

  // Fetch categories
  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(data => {
        setCategories(Array.isArray(data) ? data : data.categories || []);
      });
  }, []);

  // Fetch subcategories
  useEffect(() => {
    fetch('/api/admin/subcategories')
      .then(r => r.json())
      .then(data => {
        setSubcategories(Array.isArray(data) ? data : data.subcategories || []);
      });
  }, []);

  // Filter subcategories
  useEffect(() => {
    if (!formData.category) {
      setFilteredSubcats([]);
      return;
    }

    const selectedCategory = categories.find(
      (c: any) => c.name === formData.category
    );

    if (!selectedCategory) {
      setFilteredSubcats([]);
      return;
    }

    const filtered = subcategories.filter(
      (s: any) => s.categoryId === selectedCategory.id
    );

    setFilteredSubcats(filtered);
    setFormData(prev => ({ ...prev, subcategoryId: '' }));

  }, [formData.category, categories, subcategories]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ✅ Add image URL
  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      setError('URL invalide');
      return;
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      setError('URL invalide : seuls les protocoles http et https sont acceptés');
      return;
    }
    setImageUrls(prev => [...prev, trimmed]);
    setUrlInput('');
    setError(null);
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddUrl(); }
  };

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        slug: generateSlug(formData.name),
        priceDa: parseInt(formData.priceDa),
        category: formData.category,
        subcategoryId: formData.subcategoryId || null,
        description: formData.description,
        benefits: [],
        images: imageUrls,
        colors: formData.colors
          ? formData.colors.split(',').map(c => c.trim())
          : [],
        stock: parseInt(formData.stock),
        featured: formData.featured,
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Erreur création produit');

      router.push('/admin/products');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-8">
        Nouveau produit
      </h1>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">

        <div className="bg-[#111827] border border-[#d4af37]/20 rounded-2xl p-6 space-y-4">

          <input
            name="name"
            placeholder="Nom du produit"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white"
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white"
          >
            <option value="">Choisir catégorie</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          {filteredSubcats.length > 0 && (
            <select
              name="subcategoryId"
              value={formData.subcategoryId}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white"
            >
              <option value="">Choisir sous-catégorie</option>
              {filteredSubcats.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          )}

          <textarea
            name="description"
            placeholder="Description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              name="priceDa"
              placeholder="Prix (DA)"
              value={formData.priceDa}
              onChange={handleChange}
              required
              className="px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white"
            />

            <input
              type="number"
              name="stock"
              placeholder="Stock"
              value={formData.stock}
              onChange={handleChange}
              className="px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white"
            />
          </div>

          <input
            type="text"
            name="colors"
            placeholder="Couleurs (séparées par des virgules)"
            value={formData.colors}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white"
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  featured: e.target.checked,
                }))
              }
            />
            <span className="text-white text-sm">
              Mettre en avant
            </span>
          </div>

        </div>

        {/* MULTI IMAGE via URL */}
        <div className="bg-[#111827] border border-[#d4af37]/20 rounded-2xl p-6 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={handleUrlKeyDown}
              placeholder="Entrer l'URL de l'image (Cloudinary, etc.)"
              className="flex-1 px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-4 py-3 bg-[#d4af37] text-[#0b1220] font-bold rounded-xl"
            >
              Ajouter
            </button>
          </div>

          {imageUrls.length > 0 && (
            <div className="mt-4 flex gap-4 flex-wrap">
              {imageUrls.map((src, index) => (
                <div key={index} className="relative w-32 h-32">
                  <img
                    src={src}
                    className="w-full h-full object-cover rounded-xl border border-white/10"
                    alt={`preview-${index}`}
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrls(prev => prev.filter((_, i) => i !== index))}
                    className="absolute top-2 right-2 bg-red-600 p-1 rounded-full"
                    aria-label="Supprimer cette image"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="px-6 py-3 border border-white/10 text-gray-300 rounded-xl"
          >
            <X size={16} />
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#d4af37] text-[#0b1220] font-bold rounded-xl"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>

      </form>
    </div>
  );
}