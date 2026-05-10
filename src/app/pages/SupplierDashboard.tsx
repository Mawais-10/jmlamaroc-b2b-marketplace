import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Store, Package, Plus, Edit, Trash2, Upload, ImagePlus, X, CheckCircle,
  Send, Phone, MapPin, Tag, Save, Eye, EyeOff, AlertCircle, Image
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  apiGetMyStore, apiUpdateMyStore, apiUploadStoreAvatar, apiUploadStoreCover,
  apiRemoveStoreCover, apiGetMyProducts, apiAddProduct, apiUpdateProduct, apiDeleteProduct,
  ApiStore, ApiProduct
} from '../services/api';
import { CATEGORIES } from '../data/mockData';
import { toast } from 'sonner';

const MOROCCAN_CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier', 'Agadir', 'Meknes', 'Oujda', 'Kenitra', 'Tetouan', 'Safi', 'Other'];

export default function SupplierDashboard() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'overview' | 'store' | 'products' | 'add-product'>('overview');

  const [store, setStore] = useState<ApiStore | null>(null);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loadingStore, setLoadingStore] = useState(true);
  const [savingStore, setSavingStore] = useState(false);
  const [storeForm, setStoreForm] = useState<Partial<ApiStore>>({});

  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  // Product form
  const [productForm, setProductForm] = useState({
    description: '', title: '', price: '', currency: 'MAD',
    category: '', subcategory: '', tags: '', imageFile: null as File | null, imagePreview: '',
  });
  const [addingProduct, setAddingProduct] = useState(false);
  const productImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'supplier' && user.role !== 'admin') { navigate('/apply-supplier'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [storeRes, productsRes] = await Promise.all([apiGetMyStore(), apiGetMyProducts()]);
      setStore(storeRes.store);
      setStoreForm(storeRes.store);
      setProducts(productsRes.products);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load store data');
    } finally {
      setLoadingStore(false);
    }
  };

  const handleSaveStore = async () => {
    setSavingStore(true);
    try {
      const res = await apiUpdateMyStore({
        name: storeForm.name,
        description: storeForm.description,
        categories: storeForm.categories,
        city: storeForm.city,
        telegramHandle: storeForm.telegramHandle,
        whatsappNumber: storeForm.whatsappNumber,
      });
      setStore(res.store);
      toast.success('Store updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update store');
    } finally {
      setSavingStore(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading('Uploading avatar...');
      const res = await apiUploadStoreAvatar(file);
      setStore(res.store);
      toast.dismiss();
      toast.success('Avatar uploaded!');
    } catch {
      toast.dismiss();
      toast.error('Failed to upload avatar');
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading('Uploading cover image...');
      const res = await apiUploadStoreCover(file);
      setStore(res.store);
      toast.dismiss();
      toast.success('Cover image uploaded!');
    } catch {
      toast.dismiss();
      toast.error('Failed to upload cover image');
    }
  };

  const handleRemoveCover = async (index: number) => {
    try {
      const res = await apiRemoveStoreCover(index);
      setStore(res.store);
      toast.success('Cover image removed');
    } catch {
      toast.error('Failed to remove cover image');
    }
  };

  const handleProductImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setProductForm(prev => ({ ...prev, imageFile: file, imagePreview: preview }));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.imageFile) { toast.error('Product image is required'); return; }
    if (!productForm.category) { toast.error('Category is required'); return; }

    setAddingProduct(true);
    try {
      const fd = new FormData();
      fd.append('image', productForm.imageFile);
      fd.append('description', productForm.description);
      fd.append('title', productForm.title);
      fd.append('price', productForm.price);
      fd.append('currency', productForm.currency);
      fd.append('category', productForm.category);
      fd.append('subcategory', productForm.subcategory);
      fd.append('tags', productForm.tags);

      const res = await apiAddProduct(fd);
      if (res.success) {
        setProducts(prev => [res.product, ...prev]);
        setProductForm({ description: '', title: '', price: '', currency: 'MAD', category: '', subcategory: '', tags: '', imageFile: null, imagePreview: '' });
        toast.success('Product added and uploaded to Cloudinary!');
        setTab('products');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to add product');
    } finally {
      setAddingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await apiDeleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleToggleProduct = async (product: ApiProduct) => {
    try {
      const res = await apiUpdateProduct(product._id, { isActive: !product.isActive });
      setProducts(prev => prev.map(p => p._id === product._id ? res.product : p));
      toast.success(`Product ${res.product.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update product');
    }
  };

  if (loadingStore) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#1A7A5E] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-[#CCCCCC]" />
          <p className="text-lg font-semibold text-[#444444]">Store not found</p>
          <p className="text-sm text-[#888888]">Please contact support</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Store },
    { id: 'store', label: 'Store Profile', icon: Edit },
    { id: 'products', label: `Products (${products.length})`, icon: Package },
    { id: 'add-product', label: 'Add Product', icon: Plus },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#CCCCCC] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {store.avatar ? (
              <img src={store.avatar} alt={store.name} className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div style={{ backgroundColor: '#1A7A5E' }} className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold">
                {store.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-[#1A1A1A]">{store.name}</h1>
              <p className="text-xs text-[#888888]">@{store.handle} · Supplier Dashboard</p>
            </div>
          </div>
          <a
            href={`/groups/${store.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#CCCCCC] text-sm text-[#444444] hover:border-[#1A7A5E] hover:text-[#1A7A5E] transition-colors"
          >
            <Eye size={15} /> View Store
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[#CCCCCC]">
        <div className="max-w-5xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'border-[#1A7A5E] text-[#1A7A5E]'
                  : 'border-transparent text-[#888888] hover:text-[#1A1A1A]'
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Products', value: products.length, color: '#1A7A5E' },
                { label: 'Active Products', value: products.filter(p => p.isActive).length, color: '#1A7A5E' },
                { label: 'Followers', value: store.followerCount, color: '#E8820C' },
                { label: 'Store Status', value: store.isApproved ? 'Active' : 'Paused', color: store.isApproved ? '#1A7A5E' : '#888888' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-xl border border-[#CCCCCC] p-4">
                  <p className="text-xs text-[#888888] mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Store preview */}
            <div className="bg-white rounded-xl border border-[#CCCCCC] overflow-hidden">
              <div className="h-36 grid grid-cols-4 overflow-hidden">
                {store.coverImages.length > 0 ? (
                  store.coverImages.slice(0, 4).map((img, i) => (
                    <img key={i} src={img.url} alt="" className="w-full h-full object-cover" />
                  ))
                ) : (
                  <div className="col-span-4 flex items-center justify-center" style={{ backgroundColor: '#E8F5F0' }}>
                    <p className="text-[#1A7A5E] text-sm font-medium">Add cover images →</p>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {store.avatar ? (
                    <img src={store.avatar} alt="" className="w-12 h-12 rounded-xl object-cover -mt-8 border-2 border-white shadow-md" />
                  ) : (
                    <div style={{ backgroundColor: '#1A7A5E' }} className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold -mt-8 border-2 border-white shadow-md">
                      {store.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-[#1A1A1A]">{store.name}</p>
                    <p className="text-xs text-[#888888]">@{store.handle} · {store.city}</p>
                  </div>
                </div>
                <p className="text-sm text-[#444444]">{store.description || 'No description yet'}</p>
                <div className="flex gap-2 mt-3">
                  {store.telegramLink && (
                    <span className="text-xs px-2 py-1 rounded text-white" style={{ backgroundColor: '#229ED9' }}>Telegram ✓</span>
                  )}
                  {store.whatsappLink && (
                    <span className="text-xs px-2 py-1 rounded text-white" style={{ backgroundColor: '#25D366' }}>WhatsApp ✓</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid sm:grid-cols-2 gap-4">
              <button onClick={() => setTab('add-product')}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#CCCCCC] hover:border-[#1A7A5E] transition-colors text-left">
                <div style={{ backgroundColor: '#E8F5F0' }} className="p-2 rounded-lg">
                  <Plus size={20} style={{ color: '#1A7A5E' }} />
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A]">Add New Product</p>
                  <p className="text-xs text-[#888888]">Upload product image to Cloudinary</p>
                </div>
              </button>
              <button onClick={() => setTab('store')}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#CCCCCC] hover:border-[#1A7A5E] transition-colors text-left">
                <div style={{ backgroundColor: '#E8F5F0' }} className="p-2 rounded-lg">
                  <Edit size={20} style={{ color: '#1A7A5E' }} />
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A]">Edit Store Profile</p>
                  <p className="text-xs text-[#888888]">Update info, contacts, cover images</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Store Profile Tab */}
        {tab === 'store' && (
          <div className="space-y-5">
            {/* Avatar & Cover */}
            <div className="bg-white rounded-xl border border-[#CCCCCC] p-5">
              <h3 className="font-semibold text-[#1A1A1A] mb-4">Store Images</h3>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-5">
                {store.avatar ? (
                  <img src={store.avatar} alt="" className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div style={{ backgroundColor: '#1A7A5E' }} className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                    {store.name.charAt(0)}
                  </div>
                )}
                <div>
                  <button
                    onClick={() => avatarRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 border border-[#CCCCCC] rounded-lg text-sm hover:border-[#1A7A5E] transition-colors"
                  >
                    <Upload size={15} /> Change Avatar
                  </button>
                  <p className="text-xs text-[#888888] mt-1">Uploaded to Cloudinary. JPG/PNG, recommended 400×400</p>
                  <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>
              </div>

              {/* Cover images */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[#444444]">Cover Images ({store.coverImages.length}/4)</p>
                  {store.coverImages.length < 4 && (
                    <button
                      onClick={() => coverRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-[#CCCCCC] rounded-lg text-xs hover:border-[#1A7A5E] transition-colors"
                    >
                      <ImagePlus size={13} /> Add Cover
                    </button>
                  )}
                  <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {store.coverImages.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleRemoveCover(i)}
                        className="absolute top-1 right-1 p-0.5 rounded bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {Array.from({ length: 4 - store.coverImages.length }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg border-2 border-dashed border-[#CCCCCC] flex items-center justify-center">
                      <Image size={20} className="text-[#CCCCCC]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Store details form */}
            <div className="bg-white rounded-xl border border-[#CCCCCC] p-5 space-y-4">
              <h3 className="font-semibold text-[#1A1A1A]">Store Information</h3>

              <div>
                <label className="block text-sm font-medium text-[#444444] mb-1.5">Store Name</label>
                <input
                  value={storeForm.name || ''}
                  onChange={e => setStoreForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A7A5E] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#444444] mb-1.5">Description</label>
                <textarea
                  value={storeForm.description || ''}
                  onChange={e => setStoreForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A7A5E] transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#444444] mb-1.5">City</label>
                  <select
                    value={storeForm.city || ''}
                    onChange={e => setStoreForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A7A5E] transition-colors bg-white"
                  >
                    {MOROCCAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#444444] mb-1.5">Categories</label>
                  <input
                    value={Array.isArray(storeForm.categories) ? storeForm.categories.join(', ') : ''}
                    onChange={e => setStoreForm(prev => ({ ...prev, categories: e.target.value.split(',').map(c => c.trim()) }))}
                    placeholder="Fashion, Beauty, ..."
                    className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A7A5E] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#444444] mb-1.5">
                    <span className="text-[#25D366]">WhatsApp</span> Number
                  </label>
                  <input
                    value={storeForm.whatsappNumber || ''}
                    onChange={e => setStoreForm(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                    placeholder="+212661234567"
                    className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A7A5E] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#444444] mb-1.5">
                    <span className="text-[#229ED9]">Telegram</span> Username
                  </label>
                  <input
                    value={storeForm.telegramHandle || ''}
                    onChange={e => setStoreForm(prev => ({ ...prev, telegramHandle: e.target.value }))}
                    placeholder="@your_channel"
                    className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A7A5E] transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveStore}
                disabled={savingStore}
                className="w-full py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ backgroundColor: '#1A7A5E' }}
              >
                {savingStore ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Saving...</> : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {tab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1A1A1A]">{products.length} Products</h2>
              <button
                onClick={() => setTab('add-product')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#1A7A5E' }}
              >
                <Plus size={16} /> Add Product
              </button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-[#CCCCCC]">
                <Package size={48} className="mx-auto mb-4 text-[#CCCCCC]" />
                <p className="text-lg font-semibold text-[#444444]">No products yet</p>
                <p className="text-sm text-[#888888] mb-4">Add your first product with an image uploaded to Cloudinary</p>
                <button onClick={() => setTab('add-product')} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: '#1A7A5E' }}>
                  Add First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(product => (
                  <div key={product._id} className={`bg-white rounded-xl border overflow-hidden transition-all ${product.isActive ? 'border-[#CCCCCC] hover:border-[#1A7A5E]' : 'border-[#CCCCCC] opacity-60'}`}>
                    <div className="relative aspect-square">
                      <img src={product.imageUrl} alt={product.description} className="w-full h-full object-cover" />
                      {!product.isActive && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-xs font-medium px-2 py-1 bg-black/60 rounded">Hidden</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-[#888888] truncate">{product.category}</p>
                      <p className="text-sm font-medium text-[#1A1A1A] truncate">{product.description || product.title || 'No description'}</p>
                      {product.price ? (
                        <p className="text-sm font-bold mt-1" style={{ color: '#1A7A5E' }}>{product.price} {product.currency}</p>
                      ) : (
                        <p className="text-xs text-[#888888] mt-1">Price on request</p>
                      )}
                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={() => handleToggleProduct(product)}
                          className="flex-1 p-1.5 rounded-lg border border-[#CCCCCC] hover:border-[#1A7A5E] transition-colors flex items-center justify-center"
                          title={product.isActive ? 'Hide product' : 'Show product'}
                        >
                          {product.isActive ? <EyeOff size={14} className="text-[#888888]" /> : <Eye size={14} style={{ color: '#1A7A5E' }} />}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="flex-1 p-1.5 rounded-lg border border-[#CCCCCC] hover:border-red-400 transition-colors flex items-center justify-center"
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Product Tab */}
        {tab === 'add-product' && (
          <div className="max-w-xl">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-5">Add New Product</h2>

            <form onSubmit={handleAddProduct} className="bg-white rounded-xl border border-[#CCCCCC] p-6 space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-[#444444] mb-2">Product Image <span className="text-red-500">*</span></label>
                {productForm.imagePreview ? (
                  <div className="relative">
                    <img src={productForm.imagePreview} alt="preview" className="w-full h-48 object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={() => setProductForm(prev => ({ ...prev, imageFile: null, imagePreview: '' }))}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
                    >
                      <X size={14} />
                    </button>
                    <div className="mt-1 flex items-center gap-1 text-xs" style={{ color: '#1A7A5E' }}>
                      <CheckCircle size={12} /> Will be uploaded to Cloudinary on submit
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => productImageRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-[#CCCCCC] rounded-xl flex flex-col items-center justify-center hover:border-[#1A7A5E] transition-colors"
                  >
                    <Upload size={32} className="mb-2 text-[#CCCCCC]" />
                    <p className="text-sm text-[#888888]">Click to upload product image</p>
                    <p className="text-xs text-[#888888]">JPG, PNG, WebP · Max 10MB · Saved to Cloudinary</p>
                  </button>
                )}
                <input ref={productImageRef} type="file" accept="image/*" className="hidden" onChange={handleProductImageSelect} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#444444] mb-1.5">Category <span className="text-red-500">*</span></label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A7A5E] bg-white"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#444444] mb-1.5">Subcategory</label>
                  <input
                    value={productForm.subcategory}
                    onChange={e => setProductForm(prev => ({ ...prev, subcategory: e.target.value }))}
                    placeholder="e.g. Dresses"
                    className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A7A5E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#444444] mb-1.5">Description</label>
                <input
                  value={productForm.description}
                  onChange={e => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Product description"
                  className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A7A5E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#444444] mb-1.5">Price (leave empty = on request)</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={e => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="e.g. 120"
                    min="0"
                    step="0.01"
                    className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A7A5E]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#444444] mb-1.5">Currency</label>
                  <select
                    value={productForm.currency}
                    onChange={e => setProductForm(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A7A5E] bg-white"
                  >
                    {['MAD', 'EUR', 'USD', 'AED'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#444444] mb-1.5">Tags (comma separated)</label>
                <input
                  value={productForm.tags}
                  onChange={e => setProductForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g. summer, casual, women"
                  className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A7A5E]"
                />
              </div>

              <button
                type="submit"
                disabled={addingProduct}
                className="w-full py-3.5 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ backgroundColor: '#1A7A5E' }}
              >
                {addingProduct ? (
                  <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Uploading to Cloudinary...</>
                ) : (
                  <><Upload size={16} /> Upload & Add Product</>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
