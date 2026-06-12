'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, Trash2, X } from 'lucide-react';
import { compressProductImage } from '@/lib/clientImageCompression';

type ColorVariantForm = {
  name: string;
  hex: string;
  imageUrl: string;
  stock: string;
};

export default function CreateProduct() {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [filteredSubcats, setFilteredSubcats] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ MULTI IMAGES via URL
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [colorVariants, setColorVariants] = useState<ColorVariantForm[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategoryId: '',
    description: '',
    priceDa: '',
    oldPriceDa: '',
    stock: '0',
    featured: false,
    promotion: false,
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

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    setUploading(true);
    setError(null);

    try {
      const form = new FormData();
      for (const file of Array.from(files)) {
        const compressed = await compressProductImage(file);
        form.append('files', compressed);
      }

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: form,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Erreur upload image');

      setImageUrls(prev => [...prev, ...(Array.isArray(data.urls) ? data.urls : [])]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const variantStockTotal = colorVariants.reduce((sum, color) => sum + (color.stock ? Math.max(0, parseInt(color.stock) || 0) : 0), 0);
  const hasVariantStocks = colorVariants.some((color) => color.name.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        slug: generateSlug(formData.name),
        priceDa: parseInt(formData.priceDa),
        oldPriceDa: formData.promotion && formData.oldPriceDa ? parseInt(formData.oldPriceDa) : null,
        category: formData.category,
        subcategoryId: formData.subcategoryId || null,
        description: formData.description,
        benefits: [],
        images: imageUrls,
        colors: colorVariants
          .filter((color) => color.name.trim())
          .map((color, index) => ({
            name: color.name.trim(),
            hex: color.hex.trim() || null,
            imageUrl: color.imageUrl || null,
            stock: hasVariantStocks ? (color.stock ? parseInt(color.stock) : 0) : null,
            sortOrder: index,
          })),
        stock: hasVariantStocks ? variantStockTotal : parseInt(formData.stock),
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

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.promotion}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  promotion: e.target.checked,
                  oldPriceDa: e.target.checked ? prev.oldPriceDa : '',
                }))
              }
            />
            <span className="text-white text-sm">
              Promotion
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formData.promotion && (
              <div>
                <label className="block text-sm text-gray-300 mb-2">Ancien prix</label>
                <input
                  type="number"
                  name="oldPriceDa"
                  placeholder="Ancien prix (DA)"
                  value={formData.oldPriceDa}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                {formData.promotion ? 'Nouveau prix' : 'Prix'}
              </label>
              <input
                type="number"
                name="priceDa"
                placeholder={formData.promotion ? 'Nouveau prix (DA)' : 'Prix (DA)'}
                value={formData.priceDa}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Stock</label>
              <input
                type="number"
                name="stock"
                placeholder="Nombre en stock"
                value={formData.stock}
                onChange={handleChange}
                disabled={hasVariantStocks}
                className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white"
              />
              {hasVariantStocks && (
                <p className="mt-2 text-xs text-[#d4af37]">Stock total calculé depuis les couleurs : {variantStockTotal} pièces.</p>
              )}
            </div>
          </div>

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

        {/* MULTI IMAGE via upload ou URL */}
        <div className="bg-[#111827] border border-[#d4af37]/20 rounded-2xl p-6 space-y-4">
          <label className="flex flex-col items-center justify-center gap-3 border border-dashed border-[#d4af37]/40 rounded-2xl p-6 bg-[#0f172a] text-center cursor-pointer hover:border-[#d4af37] transition">
            <ImagePlus className="text-[#d4af37]" size={28} />
            <span className="text-white font-semibold">
              {uploading ? 'Compression et upload...' : 'Uploader des images produit'}
            </span>
            <span className="text-gray-400 text-sm">
              JPG, PNG ou WEBP compressés automatiquement
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={uploading}
              onChange={(e) => handleUploadFiles(e.target.files)}
              className="hidden"
            />
          </label>

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
              className="px-4 py-3 bg-[#d4af37] text-[#0b1220] font-bold rounded-xl disabled:opacity-60"
              disabled={uploading}
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

        <div className="bg-[#111827] border border-[#d4af37]/20 rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-white font-bold mb-1">Couleurs produit</h2>
              <p className="text-gray-400 text-sm">Associe chaque couleur à une image si le modèle existe en plusieurs finitions.</p>
            </div>
            <button
              type="button"
              onClick={() => setColorVariants((prev) => [...prev, { name: '', hex: '#D4AF37', imageUrl: imageUrls[0] || '', stock: '' }])}
              className="px-4 py-2 bg-[#d4af37] text-[#0b1220] font-bold rounded-xl"
            >
              Ajouter couleur
            </button>
          </div>

          {colorVariants.length === 0 && (
            <p className="text-sm text-gray-400">Aucune couleur spécifique. Le produit utilisera ses images générales.</p>
          )}
          {hasVariantStocks && (
            <div className="rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f4d58a]">
              Stock total calculé : {variantStockTotal} pièces
            </div>
          )}

          <div className="space-y-4">
            {colorVariants.map((color, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_120px_1fr_110px_auto] gap-3 items-end rounded-xl border border-white/10 bg-[#0f172a] p-4">
                <label className="block">
                  <span className="block text-xs text-gray-300 mb-1">Nom couleur</span>
                  <input
                    value={color.name}
                    onChange={(e) => setColorVariants((prev) => prev.map((item, i) => i === index ? { ...item, name: e.target.value } : item))}
                    placeholder="Doré, Noir..."
                    className="w-full px-3 py-2 bg-[#111827] border border-white/10 rounded-lg text-white"
                  />
                </label>
                <label className="block">
                  <span className="block text-xs text-gray-300 mb-1">Hex</span>
                  <input
                    type="color"
                    value={color.hex || '#D4AF37'}
                    onChange={(e) => setColorVariants((prev) => prev.map((item, i) => i === index ? { ...item, hex: e.target.value } : item))}
                    className="h-10 w-full bg-[#111827] border border-white/10 rounded-lg"
                  />
                </label>
                <label className="block">
                  <span className="block text-xs text-gray-300 mb-1">Image liée</span>
                  <select
                    value={color.imageUrl}
                    onChange={(e) => setColorVariants((prev) => prev.map((item, i) => i === index ? { ...item, imageUrl: e.target.value } : item))}
                    className="w-full px-3 py-2 bg-[#111827] border border-white/10 rounded-lg text-white"
                  >
                    <option value="">Aucune</option>
                    {imageUrls.map((img, imgIndex) => (
                      <option key={img} value={img}>Image {imgIndex + 1}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-xs text-gray-300 mb-1">Stock</span>
                  <input
                    type="number"
                    value={color.stock}
                    onChange={(e) => setColorVariants((prev) => prev.map((item, i) => i === index ? { ...item, stock: e.target.value } : item))}
                    placeholder="Optionnel"
                    className="w-full px-3 py-2 bg-[#111827] border border-white/10 rounded-lg text-white"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setColorVariants((prev) => prev.filter((_, i) => i !== index))}
                  className="h-10 rounded-lg border border-red-500/40 px-3 text-red-300 hover:bg-red-500/10"
                  aria-label="Supprimer cette couleur"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex gap-4 justify-end bg-[#0b1220]/95 py-4">
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
