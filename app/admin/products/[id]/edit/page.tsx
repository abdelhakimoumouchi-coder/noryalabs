'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ImagePlus, Trash2, X } from 'lucide-react';
import { compressProductImage } from '@/lib/clientImageCompression';

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [filteredSubcats, setFilteredSubcats] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newUrls, setNewUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategoryId: '',
    description: '',
    priceDa: '',
    stock: '0',
    colors: '',
    isFeatured: false,
  });

  // 🔹 Fetch product
  useEffect(() => {
    fetch(`/api/admin/products/${productId}`)
      .then(r => r.json())
      .then(data => {
        const product = data.product ?? data;

        setFormData({
          name: product.name || '',
          category: product.category || '',
          subcategoryId: product.subcategoryId || '',
          description: product.description || '',
          priceDa: String(product.priceDa || ''),
          stock: String(product.stock || 0),
          colors: product.colors?.join(', ') || '',
          isFeatured: product.isFeatured || false,
        });

        // ✅ Fix image
        if (Array.isArray(product.images)) {
          setExistingImages(product.images);
        } else if (typeof product.images === 'string') {
          setExistingImages([product.images]);
        } else {
          setExistingImages([]);
        }
      });
  }, [productId]);

  // 🔹 Fetch categories
  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(data => setCategories(data));
  }, []);

  // 🔹 Fetch subcategories
  useEffect(() => {
    fetch('/api/admin/subcategories')
      .then(r => r.json())
      .then(data => setSubcategories(data));
  }, []);

  // 🔹 Filter subcategories
  useEffect(() => {
    if (!formData.category) {
      setFilteredSubcats([]);
      return;
    }

    const selectedCategory = categories.find(
      (c: any) => c.name === formData.category
    );

    if (!selectedCategory) return;

    const filtered = subcategories.filter(
      (s: any) => s.categoryId === selectedCategory.id
    );

    setFilteredSubcats(filtered);
  }, [formData.category, categories, subcategories]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // 🔹 Add new image URL
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
    setNewUrls(prev => [...prev, trimmed]);
    setUrlInput('');
    setError(null);
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddUrl(); }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewUrl = (index: number) => {
    setNewUrls(prev => prev.filter((_, i) => i !== index));
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

      setNewUrls(prev => [...prev, ...(Array.isArray(data.urls) ? data.urls : [])]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const finalImages = [...existingImages, ...newUrls];

      const payload = {
        name: formData.name,
        slug: generateSlug(formData.name),
        priceDa: parseInt(formData.priceDa),
        category: formData.category,
        subcategoryId: formData.subcategoryId || undefined,
        description: formData.description,
        images: finalImages,
        colors: formData.colors
          ? formData.colors.split(',').map(c => c.trim())
          : [],
        stock: parseInt(formData.stock),
        isFeatured: formData.isFeatured,
      };

      const response = await fetch(
        `/api/admin/products/${productId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.details || 'Erreur modification');
      }

      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#d4af37] mb-3"
          >
            <ArrowLeft size={16} />
            Retour aux produits
          </button>
          <h1 className="text-3xl font-black text-white">
            Modifier produit
          </h1>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">

        <div className="bg-[#111827] border border-[#d4af37]/20 rounded-2xl p-6 space-y-4">

          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#0f172a] border rounded-xl text-white"
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#0f172a] border rounded-xl text-white"
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
              className="w-full px-4 py-3 bg-[#0f172a] border rounded-xl text-white"
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
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 bg-[#0f172a] border rounded-xl text-white"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="number"
              name="priceDa"
              value={formData.priceDa}
              onChange={handleChange}
              className="px-4 py-3 bg-[#0f172a] border rounded-xl text-white"
            />

            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="px-4 py-3 bg-[#0f172a] border rounded-xl text-white"
            />
          </div>

          <input
            type="text"
            name="colors"
            value={formData.colors}
            onChange={handleChange}
            placeholder="Couleurs (séparées par des virgules)"
            className="w-full px-4 py-3 bg-[#0f172a] border rounded-xl text-white"
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
            />
            <span className="text-white text-sm">
              Mettre en avant
            </span>
          </div>

        </div>

        <div className="bg-[#111827] border border-[#d4af37]/20 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-white font-bold mb-1">Images produit</h2>
            <p className="text-gray-400 text-sm">Ajoute une image compressée ou une URL HTTP/HTTPS.</p>
          </div>

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

          {existingImages.length > 0 && (
            <div>
              <p className="text-gray-300 text-sm mb-3">Images actuelles</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {existingImages.map((img, i) => (
                  <div key={i} className="relative aspect-square">
                    <img src={img} className="w-full h-full object-cover rounded-xl border border-white/10" alt={`image-actuelle-${i}`} />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute top-2 right-2 bg-red-600 p-1 rounded-full text-white shadow"
                      aria-label="Supprimer cette image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {newUrls.length > 0 && (
            <div>
              <p className="text-gray-300 text-sm mb-3">Nouvelles images</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {newUrls.map((src, i) => (
                  <div key={i} className="relative aspect-square">
                    <img
                      src={src}
                      alt={`preview-${i}`}
                      className="w-full h-full object-cover rounded-xl border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewUrl(i)}
                      className="absolute top-2 right-2 bg-red-600 p-1 rounded-full text-white shadow"
                      aria-label="Supprimer cette image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-10 flex gap-4 justify-end bg-[#0b1220]/95 py-4">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="px-6 py-3 border rounded-xl"
          >
            <X size={16} />
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#d4af37] text-black font-bold rounded-xl"
          >
            {loading ? 'Enregistrement...' : 'Modifier'}
          </button>
        </div>

      </form>
    </div>
  );
}
