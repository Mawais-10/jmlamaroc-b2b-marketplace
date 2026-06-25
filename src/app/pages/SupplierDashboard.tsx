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
import { useTranslation } from '../i18n/useTranslation';

const MOROCCAN_CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier', 'Agadir', 'Meknes', 'Oujda', 'Kenitra', 'Tetouan', 'Safi', 'Other'];

export default function SupplierDashboard() {
  const { user } = useApp();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
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
      toast.error(err.message || (language === 'ar' ? 'فشل تحميل بيانات المتجر' : language === 'fr' ? 'Échec du chargement des données du magasin' : 'Failed to load store data'));
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
      toast.success(language === 'ar' ? 'تم تحديث المتجر بنجاح!' : language === 'fr' ? 'Magasin mis à jour avec succès !' : 'Store updated successfully!');
    } catch (err: any) {
      toast.error(err.message || (language === 'ar' ? 'فشل تحديث المتجر' : language === 'fr' ? 'Échec de la mise à jour du magasin' : 'Failed to update store'));
    } finally {
      setSavingStore(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading(language === 'ar' ? 'جاري رفع الصورة الشخصية...' : language === 'fr' ? 'Téléchargement de l\'avatar...' : 'Uploading avatar...');
      const res = await apiUploadStoreAvatar(file);
      setStore(res.store);
      toast.dismiss();
      toast.success(language === 'ar' ? 'تم رفع الصورة الشخصية!' : language === 'fr' ? 'Avatar téléchargé !' : 'Avatar uploaded!');
    } catch {
      toast.dismiss();
      toast.error(language === 'ar' ? 'فشل رفع الصورة الشخصية' : language === 'fr' ? 'Échec du téléchargement de l\'avatar' : 'Failed to upload avatar');
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading(language === 'ar' ? 'جاري رفع غلاف الصفحة...' : language === 'fr' ? 'Téléchargement de la couverture...' : 'Uploading cover image...');
      const res = await apiUploadStoreCover(file);
      setStore(res.store);
      toast.dismiss();
      toast.success(language === 'ar' ? 'تم رفع الغلاف بنجاح!' : language === 'fr' ? 'Image de couverture téléchargée !' : 'Cover image uploaded!');
    } catch {
      toast.dismiss();
      toast.error(language === 'ar' ? 'فشل رفع غلاف الصفحة' : language === 'fr' ? 'Échec du téléchargement de la couverture' : 'Failed to upload cover image');
    }
  };

  const handleRemoveCover = async (index: number) => {
    try {
      const res = await apiRemoveStoreCover(index);
      setStore(res.store);
      toast.success(language === 'ar' ? 'تمت إزالة الغلاف' : language === 'fr' ? 'Image de couverture retirée' : 'Cover image removed');
    } catch {
      toast.error(language === 'ar' ? 'فشل إزالة الغلاف' : language === 'fr' ? 'Échec du retrait de la couverture' : 'Failed to remove cover image');
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
    if (!productForm.imageFile) { toast.error(language === 'ar' ? 'صورة المنتج مطلوبة' : language === 'fr' ? 'Image du produit requise' : 'Product image is required'); return; }
    if (!productForm.category) { toast.error(language === 'ar' ? 'الفئة مطلوبة' : language === 'fr' ? 'Catégorie requise' : 'Category is required'); return; }

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
        toast.success(language === 'ar' ? 'تمت إضافة المنتج ورفعه بنجاح!' : language === 'fr' ? 'Produit ajouté et téléchargé avec succès !' : 'Product added and uploaded to Cloudinary!');
        setTab('products');
      }
    } catch (err: any) {
      toast.error(err.message || (language === 'ar' ? 'فشل إضافة المنتج' : language === 'fr' ? 'Échec de l\'ajout du produit' : 'Failed to add product'));
    } finally {
      setAddingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm(language === 'ar' ? 'حذف هذا المنتج؟' : language === 'fr' ? 'Supprimer ce produit ?' : 'Delete this product?')) return;
    try {
      await apiDeleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success(language === 'ar' ? 'تم حذف المنتج' : language === 'fr' ? 'Produit supprimé' : 'Product deleted');
    } catch {
      toast.error(language === 'ar' ? 'فشل حذف المنتج' : language === 'fr' ? 'Échec de la suppression du produit' : 'Failed to delete product');
    }
  };

  const handleToggleProduct = async (product: ApiProduct) => {
    try {
      const res = await apiUpdateProduct(product._id, { isActive: !product.isActive });
      setProducts(prev => prev.map(p => p._id === product._id ? res.product : p));
      toast.success(
        language === 'ar' 
          ? `تم ${res.product.isActive ? 'تنشيط' : 'إلغاء تنشيط'} المنتج` 
          : language === 'fr'
            ? `Produit ${res.product.isActive ? 'activé' : 'désactivé'}`
            : `Product ${res.product.isActive ? 'activated' : 'deactivated'}`
      );
    } catch {
      toast.error(language === 'ar' ? 'فشل تحديث المنتج' : language === 'fr' ? 'Échec de la mise à jour du produit' : 'Failed to update product');
    }
  };

  if (loadingStore) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#E85D04] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-[#CCCCCC]" />
          <p className="text-lg font-semibold text-[#444444]">
            {language === 'ar' ? 'المتجر غير موجود' : language === 'fr' ? 'Magasin non trouvé' : 'Store not found'}
          </p>
          <p className="text-sm text-[#888888]">
            {language === 'ar' ? 'يرجى الاتصال بالدعم الفني' : language === 'fr' ? 'Veuillez contacter le support' : 'Please contact support'}
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: language === 'ar' ? 'نظرة عامة' : language === 'fr' ? 'Aperçu' : 'Overview', icon: Store },
    { id: 'store', label: language === 'ar' ? 'ملف المتجر' : language === 'fr' ? 'Profil du magasin' : 'Store Profile', icon: Edit },
    { id: 'products', label: language === 'ar' ? `المنتجات (${products.length})` : language === 'fr' ? `Produits (${products.length})` : `Products (${products.length})`, icon: Package },
    { id: 'add-product', label: language === 'ar' ? 'إضافة منتج' : language === 'fr' ? 'Ajouter un produit' : 'Add Product', icon: Plus },
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
              <div style={{ backgroundColor: '#E85D04' }} className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold">
                {store.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-[#1A1A1A]">{store.name}</h1>
              <p className="text-xs text-[#888888]">@{store.handle} · {language === 'ar' ? 'لوحة تحكم المورد' : language === 'fr' ? 'Tableau de bord du fournisseur' : 'Supplier Dashboard'}</p>
            </div>
          </div>
          <a
            href={`/groups/${store.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#CCCCCC] text-sm text-[#444444] hover:border-[#E85D04] hover:text-[#E85D04] transition-colors"
          >
            <Eye size={15} /> {language === 'ar' ? 'عرض المتجر' : language === 'fr' ? 'Voir le magasin' : 'View Store'}
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
                  ? 'border-[#E85D04] text-[#E85D04]'
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
                { label: language === 'ar' ? 'إجمالي المنتجات' : language === 'fr' ? 'Total des produits' : 'Total Products', value: products.length, color: '#E85D04' },
                { label: language === 'ar' ? 'المنتجات النشطة' : language === 'fr' ? 'Produits actifs' : 'Active Products', value: products.filter(p => p.isActive).length, color: '#E85D04' },
                { label: language === 'ar' ? 'المتابعون' : language === 'fr' ? 'Abonnés' : 'Followers', value: store.followerCount, color: '#E8820C' },
                {
                  label: language === 'ar' ? 'حالة المتجر' : language === 'fr' ? 'Statut du magasin' : 'Store Status',
                  value: store.isApproved
                    ? (language === 'ar' ? 'نشط' : language === 'fr' ? 'Actif' : 'Active')
                    : (language === 'ar' ? 'متوقف مؤقتاً' : language === 'fr' ? 'En pause' : 'Paused'),
                  color: store.isApproved ? '#E85D04' : '#888888'
                },
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
                  <div className="col-span-4 flex items-center justify-center" style={{ backgroundColor: '#FFF2EB' }}>
                    <p className="text-[#E85D04] text-sm font-medium">
                      {language === 'ar' ? 'أضف صور غلاف ←' : language === 'fr' ? 'Ajouter des images de couverture →' : 'Add cover images →'}
                    </p>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {store.avatar ? (
                    <img src={store.avatar} alt="" className="w-12 h-12 rounded-xl object-cover -mt-8 border-2 border-white shadow-md" />
                  ) : (
                    <div style={{ backgroundColor: '#E85D04' }} className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold -mt-8 border-2 border-white shadow-md">
                      {store.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-[#1A1A1A]">{store.name}</p>
                    <p className="text-xs text-[#888888]">@{store.handle} · {store.city}</p>
                  </div>
                </div>
                <p className="text-sm text-[#444444]">
                  {store.description || (language === 'ar' ? 'لا يوجد وصف بعد' : language === 'fr' ? 'Pas encore de description' : 'No description yet')}
                </p>
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
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#CCCCCC] hover:border-[#E85D04] transition-colors text-left">
                <div style={{ backgroundColor: '#FFF2EB' }} className="p-2 rounded-lg">
                  <Plus size={20} style={{ color: '#E85D04' }} />
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A]">{language === 'ar' ? 'إضافة منتج جديد' : language === 'fr' ? 'Ajouter un nouveau produit' : 'Add New Product'}</p>
                  <p className="text-xs text-[#888888]">{language === 'ar' ? 'تحميل صورة المنتج إلى Cloudinary' : language === 'fr' ? "Télécharger l'image du produit vers Cloudinary" : 'Upload product image to Cloudinary'}</p>
                </div>
              </button>
              <button onClick={() => setTab('store')}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#CCCCCC] hover:border-[#E85D04] transition-colors text-left">
                <div style={{ backgroundColor: '#FFF2EB' }} className="p-2 rounded-lg">
                  <Edit size={20} style={{ color: '#E85D04' }} />
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A]">{language === 'ar' ? 'تعديل ملف المتجر' : language === 'fr' ? 'Modifier le profil du magasin' : 'Edit Store Profile'}</p>
                  <p className="text-xs text-[#888888]">{language === 'ar' ? 'تحديث المعلومات، جهات الاتصال، صور الغلاف' : language === 'fr' ? 'Mettre à jour les infos, contacts, images' : 'Update info, contacts, cover images'}</p>
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
              <h3 className="font-semibold text-[#1A1A1A] mb-4">
                {language === 'ar' ? 'صور المتجر' : language === 'fr' ? 'Images du magasin' : 'Store Images'}
              </h3>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-5">
                {store.avatar ? (
                  <img src={store.avatar} alt="" className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div style={{ backgroundColor: '#E85D04' }} className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                    {store.name.charAt(0)}
                  </div>
                )}
                <div>
                  <button
                    onClick={() => avatarRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 border border-[#CCCCCC] rounded-lg text-sm hover:border-[#E85D04] transition-colors"
                  >
                    <Upload size={15} /> {language === 'ar' ? 'تغيير الصورة الشخصية' : language === 'fr' ? 'Changer l\'avatar' : 'Change Avatar'}
                  </button>
                  <p className="text-xs text-[#888888] mt-1">
                    {language === 'ar' ? 'تم الرفع إلى Cloudinary. JPG/PNG، الحجم الموصى به 400×400' : language === 'fr' ? 'Téléchargé sur Cloudinary. JPG/PNG, recommandé 400×400' : 'Uploaded to Cloudinary. JPG/PNG, recommended 400×400'}
                  </p>
                  <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>
              </div>

              {/* Cover images */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[#444444]">
                    {language === 'ar' ? `صور الغلاف (${store.coverImages.length}/4)` : language === 'fr' ? `Images de couverture (${store.coverImages.length}/4)` : `Cover Images (${store.coverImages.length}/4)`}
                  </p>
                  {store.coverImages.length < 4 && (
                    <button
                      onClick={() => coverRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-[#CCCCCC] rounded-lg text-xs hover:border-[#E85D04] transition-colors"
                    >
                      <ImagePlus size={13} /> {language === 'ar' ? 'إضافة غلاف' : language === 'fr' ? 'Ajouter une couverture' : 'Add Cover'}
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
              <h3 className="font-semibold text-[#1A1A1A]">
                {language === 'ar' ? 'معلومات المتجر' : language === 'fr' ? 'Informations du magasin' : 'Store Information'}
              </h3>

              <div>
                <label className="block text-sm font-medium text-[#444444] mb-1.5">
                  {language === 'ar' ? 'اسم المتجر' : language === 'fr' ? 'Nom du magasin' : 'Store Name'}
                </label>
                <input
                  value={storeForm.name || ''}
                  onChange={e => setStoreForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#444444] mb-1.5">
                  {language === 'ar' ? 'الوصف' : language === 'fr' ? 'Description' : 'Description'}
                </label>
                <textarea
                  value={storeForm.description || ''}
                  onChange={e => setStoreForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04] transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#444444] mb-1.5">
                    {language === 'ar' ? 'المدينة' : language === 'fr' ? 'Ville' : 'City'}
                  </label>
                  <select
                    value={storeForm.city || ''}
                    onChange={e => setStoreForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04] transition-colors bg-white"
                  >
                    {MOROCCAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#444444] mb-1.5">
                    {language === 'ar' ? 'الفئات' : language === 'fr' ? 'Catégories' : 'Categories'}
                  </label>
                  <input
                    value={Array.isArray(storeForm.categories) ? storeForm.categories.join(', ') : ''}
                    onChange={e => setStoreForm(prev => ({ ...prev, categories: e.target.value.split(',').map(c => c.trim()) }))}
                    placeholder="Fashion, Beauty, ..."
                    className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#444444] mb-1.5">
                    {language === 'ar' ? 'رقم الواتساب' : language === 'fr' ? 'Numéro WhatsApp' : 'WhatsApp Number'}
                  </label>
                  <input
                    value={storeForm.whatsappNumber || ''}
                    onChange={e => setStoreForm(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                    placeholder="+212661234567"
                    className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#444444] mb-1.5">
                    {language === 'ar' ? 'اسم مستخدم تيليجرام' : language === 'fr' ? 'Identifiant Telegram' : 'Telegram Username'}
                  </label>
                  <input
                    value={storeForm.telegramHandle || ''}
                    onChange={e => setStoreForm(prev => ({ ...prev, telegramHandle: e.target.value }))}
                    placeholder="@your_channel"
                    className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04] transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveStore}
                disabled={savingStore}
                className="w-full py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ backgroundColor: '#E85D04' }}
              >
                {savingStore ? (
                  <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> {language === 'ar' ? 'جاري الحفظ...' : language === 'fr' ? 'Enregistrement...' : 'Saving...'}</>
                ) : (
                  <><Save size={16} /> {language === 'ar' ? 'حفظ التغييرات' : language === 'fr' ? 'Enregistrer les modifications' : 'Save Changes'}</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {tab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1A1A1A]">
                {products.length} {language === 'ar' ? 'منتج' : language === 'fr' ? 'Produits' : 'Products'}
              </h2>
              <button
                onClick={() => setTab('add-product')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#E85D04' }}
              >
                <Plus size={16} /> {language === 'ar' ? 'إضافة منتج' : language === 'fr' ? 'Ajouter un produit' : 'Add Product'}
              </button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-[#CCCCCC]">
                <Package size={48} className="mx-auto mb-4 text-[#CCCCCC]" />
                <p className="text-lg font-semibold text-[#444444]">
                  {language === 'ar' ? 'لا توجد منتجات بعد' : language === 'fr' ? 'Aucun produit pour le moment' : 'No products yet'}
                </p>
                <p className="text-sm text-[#888888] mb-4">
                  {language === 'ar' ? 'أضف منتجك الأول بصورة مرفوعة على Cloudinary' : language === 'fr' ? 'Ajoutez votre premier produit avec une image sur Cloudinary' : 'Add your first product with an image uploaded to Cloudinary'}
                </p>
                <button
                  onClick={() => setTab('add-product')}
                  className="px-4 py-2 rounded-xl text-white text-sm font-medium"
                  style={{ backgroundColor: '#E85D04' }}
                >
                  {language === 'ar' ? 'إضافة المنتج الأول' : language === 'fr' ? 'Ajouter le premier produit' : 'Add First Product'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(product => (
                  <div key={product._id} className={`bg-white rounded-xl border overflow-hidden transition-all ${product.isActive ? 'border-[#CCCCCC] hover:border-[#E85D04]' : 'border-[#CCCCCC] opacity-60'}`}>
                    <div className="relative aspect-square">
                      <img src={product.imageUrl} alt={product.description} className="w-full h-full object-cover" />
                      {!product.isActive && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-xs font-medium px-2 py-1 bg-black/60 rounded">
                            {language === 'ar' ? 'مخفي' : language === 'fr' ? 'Masqué' : 'Hidden'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-[#888888] truncate">{product.category}</p>
                      <p className="text-sm font-medium text-[#1A1A1A] truncate">{product.description || product.title || (language === 'ar' ? 'بدون وصف' : language === 'fr' ? 'Sans description' : 'No description')}</p>
                      {product.price ? (
                        <p className="text-sm font-bold mt-1" style={{ color: '#E85D04' }}>{product.price} {product.currency}</p>
                      ) : (
                        <p className="text-xs text-[#888888] mt-1">
                          {language === 'ar' ? 'السعر عند الطلب' : language === 'fr' ? 'Prix sur demande' : 'Price on request'}
                        </p>
                      )}
                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={() => handleToggleProduct(product)}
                          className="flex-1 p-1.5 rounded-lg border border-[#CCCCCC] hover:border-[#E85D04] transition-colors flex items-center justify-center"
                          title={
                            product.isActive 
                              ? (language === 'ar' ? 'إخفاء المنتج' : language === 'fr' ? 'Masquer le produit' : 'Hide product') 
                              : (language === 'ar' ? 'إظهار المنتج' : language === 'fr' ? 'Afficher le produit' : 'Show product')
                          }
                        >
                          {product.isActive ? <EyeOff size={14} className="text-[#888888]" /> : <Eye size={14} style={{ color: '#E85D04' }} />}
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
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-5">
              {language === 'ar' ? 'إضافة منتج جديد' : language === 'fr' ? 'Ajouter un nouveau produit' : 'Add New Product'}
            </h2>

            <form onSubmit={handleAddProduct} className="bg-white rounded-xl border border-[#CCCCCC] p-6 space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-[#444444] mb-2">
                  {language === 'ar' ? 'صورة المنتج' : language === 'fr' ? 'Image du produit' : 'Product Image'} <span className="text-red-500">*</span>
                </label>
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
                    <div className="mt-1 flex items-center gap-1 text-xs" style={{ color: '#E85D04' }}>
                      <CheckCircle size={12} /> {language === 'ar' ? 'سيتم الرفع إلى Cloudinary عند الإرسال' : language === 'fr' ? 'Sera téléchargé sur Cloudinary lors de la soumission' : 'Will be uploaded to Cloudinary on submit'}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => productImageRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-[#CCCCCC] rounded-xl flex flex-col items-center justify-center hover:border-[#E85D04] transition-colors"
                  >
                    <Upload size={32} className="mb-2 text-[#CCCCCC]" />
                    <p className="text-sm text-[#888888]">
                      {language === 'ar' ? 'انقر لرفع صورة المنتج' : language === 'fr' ? 'Cliquez pour télécharger l\'image' : 'Click to upload product image'}
                    </p>
                    <p className="text-xs text-[#888888]">
                      {language === 'ar' ? 'JPG، PNG، WebP · بحد أقصى 10 ميجابايت · محفوظة على Cloudinary' : language === 'fr' ? 'JPG, PNG, WebP · Max 10 Mo · Enregistré sur Cloudinary' : 'JPG, PNG, WebP · Max 10MB · Saved to Cloudinary'}
                    </p>
                  </button>
                )}
                <input ref={productImageRef} type="file" accept="image/*" className="hidden" onChange={handleProductImageSelect} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#444444] mb-1.5">
                    {language === 'ar' ? 'الفئة' : language === 'fr' ? 'Catégorie' : 'Category'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04] bg-white"
                  >
                    <option value="">{language === 'ar' ? 'اختر الفئة' : language === 'fr' ? 'Sélectionner une catégorie' : 'Select category'}</option>
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#444444] mb-1.5">
                    {language === 'ar' ? 'الفئة الفرعية' : language === 'fr' ? 'Sous-catégorie' : 'Subcategory'}
                  </label>
                  <input
                    value={productForm.subcategory}
                    onChange={e => setProductForm(prev => ({ ...prev, subcategory: e.target.value }))}
                    placeholder="e.g. Dresses"
                    className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#444444] mb-1.5">
                  {language === 'ar' ? 'الوصف' : language === 'fr' ? 'Description' : 'Description'}
                </label>
                <input
                  value={productForm.description}
                  onChange={e => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={language === 'ar' ? 'وصف المنتج' : language === 'fr' ? 'Description du produit' : 'Product description'}
                  className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#444444] mb-1.5">
                    {language === 'ar' ? 'السعر (اتركه فارغاً = عند الطلب)' : language === 'fr' ? 'Prix (laisser vide = sur demande)' : 'Price (leave empty = on request)'}
                  </label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={e => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="e.g. 120"
                    min="0"
                    step="0.01"
                    className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#444444] mb-1.5">
                    {language === 'ar' ? 'العملة' : language === 'fr' ? 'Devise' : 'Currency'}
                  </label>
                  <select
                    value={productForm.currency}
                    onChange={e => setProductForm(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04] bg-white"
                  >
                    {['MAD', 'EUR', 'USD', 'AED'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#444444] mb-1.5">
                  {language === 'ar' ? 'الوسوم (مفصولة بفاصلة)' : language === 'fr' ? 'Mots-clés (séparés par une virgule)' : 'Tags (comma separated)'}
                </label>
                <input
                  value={productForm.tags}
                  onChange={e => setProductForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g. summer, casual, women"
                  className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04]"
                />
              </div>

              <button
                type="submit"
                disabled={addingProduct}
                className="w-full py-3.5 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ backgroundColor: '#E85D04' }}
              >
                {addingProduct ? (
                  <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> {language === 'ar' ? 'جاري الرفع إلى Cloudinary...' : language === 'fr' ? 'Téléchargement sur Cloudinary...' : 'Uploading to Cloudinary...'}</>
                ) : (
                  <><Upload size={16} /> {language === 'ar' ? 'رفع وإضافة المنتج' : language === 'fr' ? 'Télécharger & Ajouter le produit' : 'Upload & Add Product'}</>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
