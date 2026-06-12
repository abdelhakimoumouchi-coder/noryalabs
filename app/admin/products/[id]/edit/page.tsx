'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ImagePlus, Trash2, X } from 'lucide-react';
import { compressProductImage } from '@/lib/clientImageCompression';

type ColorVariantForm = {
  name: string;
  hex: string;
  imageUrl: string;
  stock: string;
};

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
  const [colorVariants, setColorVariants] = useState<ColorVariantForm[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategoryId: '',
    description: '',
    priceDa: '',
    oldPriceDa: '',
    stock: '0',
    isFeatured: false,
    promotion: false,
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
          oldPriceDa: product.oldPriceDa ? String(product.oldPriceDa) : '',
          stock: String(product.stock || 0),
          isFeatured: product.isFeatured || false,
          promotion: !!product.oldPriceDa,
        });

        // ✅ Fix image
        if (Array.isArray(product.images)) {
          setExistingImages(product.images);
        } else if (typeof product.images === 'string') {
          setExistingImages([product.images]);
        } else {
          setExistingImages([]);
        }

        const productImages = Array.isArray(product.images) ? product.images : [];
        const colors = Array.isArray(product.colors) ? product.colors : [];
        setColorVariants(colors.map((color: any, index: number) => {
          if (typeof color === 'string') {
            return {
              name: color,
              hex: '#D4AF37',
              imageUrl: productImages[index] || '',
              stock: '',
            };
          }
          return {
            name: color?.name || '',
            hex: color?.hex || '#D4AF37',
            imageUrl: color?.imageUrl || '',
            stock: color?.stock != null ? String(color.stock) : '',
          };
        }).filter((color: ColorVariantForm) => color.name));
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

  const variantStockTotal = colorVariants.reduce((sum, color) => sum + (color.stock ? Math.max(0, parseInt(color.stock) || 0) : 0), 0);
  const hasVariantStocks = colorVariants.some((color) => color.name.trim());

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
        oldPriceDa: formData.promotion && formData.oldPriceDa ? parseInt(formData.oldPriceDa) : null,
        category: formData.category,
        subcategoryId: formData.subcategoryId || undefined,
        description: formData.description,
        images: finalImages,
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

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="promotion"
              checked={formData.promotion}
              onChange={handleChange}
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
                  value={formData.oldPriceDa}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0f172a] border rounded-xl text-white"
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
                value={formData.priceDa}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0f172a] border rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                disabled={hasVariantStocks}
                className="w-full px-4 py-3 bg-[#0f172a] border rounded-xl text-white"
              />
              {hasVariantStocks && (
                <p className="mt-2 text-xs text-[#d4af37]">Stock total calculé depuis les couleurs : {variantStockTotal} pièces.</p>
              )}
            </div>
          </div>

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

        <div className="bg-[#111827] border border-[#d4af37]/20 rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-white font-bold mb-1">Couleurs produit</h2>
              <p className="text-gray-400 text-sm">Associe une couleur à une image pour que la galerie change côté client.</p>
            </div>
            <button
              type="button"
              onClick={() => setColorVariants((prev) => [...prev, { name: '', hex: '#D4AF37', imageUrl: [...existingImages, ...newUrls][0] || '', stock: '' }])}
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
            {colorVariants.map((color, index) => {
              const allImages = [...existingImages, ...newUrls];
              return (
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
                      {allImages.map((img, imgIndex) => (
                        <option key={`${img}-${imgIndex}`} value={img}>Image {imgIndex + 1}</option>
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
              );
            })}
          </div>
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
