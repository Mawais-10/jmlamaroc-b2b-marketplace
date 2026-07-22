import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { 
  Search, ImagePlus, Heart, X, ChevronDown, Loader2, 
  Home, Share2, Tag, Copy, LayoutGrid, Store as StoreIcon,
  Send, MoreVertical, Image as ImageIcon, ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  apiGetProducts, apiGetStores, apiCreateSearchSession, apiGetSearchSession,
  apiSearchVisual, apiSearchVisualUrl, ApiProduct, ApiStore 
} from '../services/api';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { useTranslation } from '../i18n/useTranslation';
import { CATEGORIES } from '../data/mockData';
import ProductDetailModal from '../components/ui/ProductDetailModal';

// ─── Product Card (reference-image style) ─────────────────────────────────────
function ProductCard({
  product,
  isFav,
  onFavorite,
  onVisualSearch,
  onClick,
}: {
  product: ApiProduct;
  isFav: boolean;
  onFavorite: () => void;
  onVisualSearch: () => void;
  onClick: () => void;
}) {
  const { t, language } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const dateStr = product.createdAt
    ? new Date(product.createdAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : '';

  // First letter of store name for avatar fallback
  const avatarLetter = product.storeName?.charAt(0)?.toUpperCase() || 'S';

  return (
    <div className="bg-white border border-[#E8E8E8] rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* ── Image ── */}
      <div 
        onClick={onClick}
        className="relative w-full aspect-square overflow-hidden bg-gray-100 cursor-pointer group"
      >
        <img
          src={product.imageUrl}
          alt={product.title || product.description}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* COD + 24h banner (bottom of image) */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center h-8 overflow-hidden">
          <div className="bg-[#FF6B00] text-white text-[11px] font-black px-2 h-full flex items-center">
            COD
          </div>
          <div className="bg-[#1DB954] text-white text-[11px] font-bold flex-1 h-full flex items-center px-2 gap-1">
            <span>
              {language === 'ar' ? 'شحن خلال ' : language === 'fr' ? 'Expédié sous ' : 'Ship within '}
              <strong>{language === 'ar' ? '24 ساعة' : language === 'fr' ? '24 heures' : '24 hours'}</strong>
            </span>
            <svg className="ml-auto" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="white" opacity="0.25"/>
              <polygon points="9,7 17,12 9,17" fill="white"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── Meta ── */}
      <div className="px-3 pt-2 pb-0 flex-1 flex flex-col">
        <div onClick={onClick} className="cursor-pointer flex-1">
          {/* Date */}
          <p className="text-[11px] text-[#888] mb-1.5">{dateStr}</p>
        </div>

        {/* Store row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Store avatar */}
            <div className="w-6 h-6 rounded-full bg-[#E85D04] flex items-center justify-center text-white text-[10px] font-bold shrink-0 overflow-hidden">
              {avatarLetter}
            </div>
            <span className="text-[12px] font-semibold text-[#333] truncate max-w-[120px]">
              {product.storeName}
            </span>
          </div>
          {/* 3-dot menu */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <MoreVertical size={14} className="text-[#888]" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-7 bg-white border border-[#E8E8E8] rounded-lg shadow-lg z-50 py-1 min-w-[130px]">
                <button
                  onClick={(e) => { e.stopPropagation(); onFavorite(); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-[#333] hover:bg-gray-50"
                >
                  {isFav ? (language === 'ar' ? 'إزالة من المفضلة' : language === 'fr' ? 'Retirer des favoris' : 'Remove favorite') : (language === 'ar' ? 'حفظ في المفضلة' : language === 'fr' ? 'Ajouter aux favoris' : 'Save to favorites')}
                </button>
                <a
                  href={`https://t.me/${product.storeHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block text-left px-4 py-2 text-sm text-[#229ED9] hover:bg-gray-50"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
                >
                  {language === 'ar' ? 'افتح في تيليجرام' : language === 'fr' ? 'Ouvrir sur Telegram' : 'Open in Telegram'}
                </a>
              </div>
            )}
          </div>
        </div>

        <div onClick={onClick} className="cursor-pointer flex-1">
          {/* Title */}
          <p className="text-[13px] font-semibold text-[#111] leading-snug line-clamp-2 mb-1">
            {product.title || product.description}
          </p>

          {/* Description */}
          <p className="text-[12px] text-[#666] leading-snug line-clamp-2 mb-2">
            {product.description}
          </p>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex items-center border-t border-[#F0F0F0] mt-auto">
        {/* Favorite */}
        <button
          onClick={(e) => { e.stopPropagation(); onFavorite(); }}
          className="flex-1 flex items-center justify-center py-2.5 hover:bg-[#FFF5F0] transition-colors border-r border-[#F0F0F0]"
        >
          <Heart
            size={17}
            fill={isFav ? '#EF4444' : 'none'}
            stroke={isFav ? '#EF4444' : '#999'}
          />
        </button>
        {/* Visual search */}
        <button
          onClick={(e) => { e.stopPropagation(); onVisualSearch(); }}
          className="flex-1 flex items-center justify-center py-2.5 hover:bg-[#F5F5F5] transition-colors border-r border-[#F0F0F0]"
        >
          <Search size={17} className="text-[#555]" />
        </button>
        {/* Telegram */}
        <a
          href={`https://t.me/${product.storeHandle}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center py-2.5 hover:bg-[#EAF6FD] transition-colors"
        >
          <Send size={17} className="text-[#229ED9]" />
        </a>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isFavorite, addFavorite, removeFavorite } = useApp();
  const { t, language } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [selectedStore, setSelectedStore] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceOnly, setPriceOnly] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(searchParams.get('img') || null);

  const page = Number(searchParams.get('page')) || 1;

  const [stores, setStores] = useState<ApiStore[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);

  // State flag to prevent loadProducts from overwriting visual search results
  const [visualSearchActive, setVisualSearchActive] = useState(false);

  // Sync state with URL search params (essential for back/forward navigation and header link clicks)
  useEffect(() => {
    if (visualSearchActive) return; // Don't sync URL params during visual search
    setQuery(searchParams.get('q') || '');
    setCategory(searchParams.get('category') || '');
  }, [searchParams, visualSearchActive]);

  // Reset page to 1 when filters or query change
  useEffect(() => {
    if (visualSearchActive) return;
    const p = new URLSearchParams(searchParams);
    if (p.get('page') && p.get('page') !== '1') {
      p.set('page', '1');
      setSearchParams(p);
    }
  }, [query, category, selectedStore, sortBy, priceOnly, showDuplicates, visualSearchActive]);

  // Restore session
  useEffect(() => {
    const sessionId = searchParams.get('s');
    if (sessionId) {
      (async () => {
        try {
          const session = await apiGetSearchSession(sessionId);
          const f = session.filters;
          if (f.q) setQuery(f.q);
          if (f.category) setCategory(f.category);
          if (f.storeId) setSelectedStore(f.storeId);
          if (f.sortBy) setSortBy(f.sortBy);
          if (f.priceOnly !== undefined) setPriceOnly(f.priceOnly);
          if (f.showDuplicates !== undefined) setShowDuplicates(f.showDuplicates);
          if (f.uploadedImage) setUploadedImage(f.uploadedImage);
          toast.success(language === 'ar' ? 'تمت استعادة خلاصة البحث من الرابط المشترك' : language === 'fr' ? 'Flux de recherche restauré à partir du lien partagé' : 'Search feed restored from shared link');
        } catch (err) {
          console.error('Failed to restore session', err);
        }
      })();
    }
  }, [searchParams]);

  const getLocalizedCategoryName = (name: string) => {
    switch (name) {
      case "Women's Clothing": return language === 'ar' ? 'ملابس نسائية' : language === 'fr' ? 'Vêtements pour femmes' : "Women's Clothing";
      case 'Shoes': return language === 'ar' ? 'أحذية' : language === 'fr' ? 'Chaussures' : 'Shoes';
      case 'Jewelry': return language === 'ar' ? 'مجوهرات' : language === 'fr' ? 'Bijoux' : 'Jewelry';
      case 'Bags': return language === 'ar' ? 'حقائب' : language === 'fr' ? 'Sacs' : 'Bags';
      case "Men's Clothing": return language === 'ar' ? 'ملابس رجالية' : language === 'fr' ? 'Vêtements pour hommes' : "Men's Clothing";
      case 'Perfume': return language === 'ar' ? 'عطور' : language === 'fr' ? 'Parfums' : 'Perfume';
      case 'Kitchen Tools': return language === 'ar' ? 'أدوات المطبخ' : language === 'fr' ? 'Ustensiles de cuisine' : 'Kitchen Tools';
      case 'Skincare': return language === 'ar' ? 'العناية بالبشرة' : language === 'fr' ? 'Soins de la peau' : 'Skincare';
      case "Kids' Clothing": return language === 'ar' ? 'ملابس أطفال' : language === 'fr' ? 'Vêtements pour enfants' : "Kids' Clothing";
      case 'Kitchen Appliances': return language === 'ar' ? 'أجهزة المطبخ' : language === 'fr' ? 'Électroménager' : 'Kitchen Appliances';
      case 'Hair Care': return language === 'ar' ? 'العناية بالشعر' : language === 'fr' ? 'Soins capillaires' : 'Hair Care';
      case 'Bathroom': return language === 'ar' ? 'الحمام' : language === 'fr' ? 'Salle de bain' : 'Bathroom';
      case 'Bedding': return language === 'ar' ? 'المفروشات' : language === 'fr' ? 'Literie' : 'Bedding';
      case 'Automotive': return language === 'ar' ? 'السيارات' : language === 'fr' ? 'Automobile' : 'Automotive';
      case 'Furniture': return language === 'ar' ? 'الأثاث' : language === 'fr' ? 'Meubles' : 'Furniture';
      case 'Fashion': return language === 'ar' ? 'موضة' : language === 'fr' ? 'Mode' : 'Fashion';
      case 'Home Decor': return language === 'ar' ? 'ديكور منزلي' : language === 'fr' ? 'Décoration' : 'Home Decor';
      case 'Kitchen & Dining': return language === 'ar' ? 'المطبخ والمائدة' : language === 'fr' ? 'Cuisine & Salle' : 'Kitchen & Dining';
      case 'Electronics': return language === 'ar' ? 'الإلكترونيات' : language === 'fr' ? 'Électronique' : 'Electronics';
      case 'Beauty': return language === 'ar' ? 'العناية والتجميل' : language === 'fr' ? 'Beauté' : 'Beauty';
      case 'Kids & Babies': return language === 'ar' ? 'الأطفال والرضع' : language === 'fr' ? 'Enfants & Bébés' : 'Kids & Babies';
      case 'Home & Living': return language === 'ar' ? 'المنزل والمعيشة' : language === 'fr' ? 'Maison & Jardin' : 'Home & Living';
      default: return name;
    }
  };

  useEffect(() => { fetchStores(); }, []);

  const fetchStores = async () => {
    try {
      const res = await apiGetStores({ limit: '100', sort: 'nameAsc' });
      setStores(res.stores);
    } catch (err) {
      console.error('Failed to fetch stores', err);
    }
  };

  const loadProducts = useCallback(async () => {
    // When visual search is active, skip loading default products entirely
    if (visualSearchActive) return;
    setLoading(true);
    try {
      const params: any = {
        sort: sortBy, q: query, category, storeId: selectedStore,
        priceOnly: priceOnly ? 'true' : 'false',
        page: String(page),
        limit: '40',
      };
      const res = await apiGetProducts(params);
      setProducts(res.products);
      setTotal(res.total);
    } catch (err) {
      console.error('Product load error:', err);
    } finally {
      setLoading(false);
    }
  }, [query, category, selectedStore, sortBy, priceOnly, page, visualSearchActive]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleClearImage = () => {
    setUploadedImage(null);
    setVisualSearchActive(false);
    loadProducts();
  };

  const handlePageChange = (newPage: number) => {
    setVisualSearchActive(false);
    const p = new URLSearchParams(searchParams);
    p.set('page', String(newPage));
    setSearchParams(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = () => {
    setVisualSearchActive(false);
    const p = new URLSearchParams(searchParams);
    if (query) p.set('q', query); else p.delete('q');
    p.set('page', '1');
    setSearchParams(p);
  };

  const handleFavorite = (productId: string) => {
    if (!user) { navigate('/login?redirect=/search'); return; }
    if (isFavorite(productId)) { removeFavorite(productId); toast.success('Removed from favorites'); }
    else { addFavorite(productId); toast.success('Added to favorites!'); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setUploadedImage(URL.createObjectURL(file));
    setVisualSearchActive(true);
    toast.info(language === 'ar' ? 'يقوم الذكاء الاصطناعي بتحليل صورتك...' : language === 'fr' ? 'L\'IA analyse votre image...' : 'AI is analyzing your image...');
    try {
      const res = await apiSearchVisual(file) as any;
      if (res.success) {
        setProducts(res.products);
        setTotal(res.products.length);
        const catLabel = res.detectedCategory || '';
        toast.success(
          catLabel
            ? (language === 'ar' ? `${res.products.length} منتج مشابه متاح (فئة: ${catLabel})` :
               language === 'fr' ? `${res.products.length} produits similaires trouvés (${catLabel})` :
               `Found ${res.products.length} matching products (${catLabel})`)
            : (language === 'ar' ? `بحث بصري اكتمل! ${res.products.length} نتيجة` :
               language === 'fr' ? `Recherche visuelle terminée ! ${res.products.length} résultats` :
               `Visual search done! ${res.products.length} results found`)
        );
      } else {
        toast.error(language === 'ar' ? 'فشل البحث البصري' : language === 'fr' ? 'Échec de la recherche visuelle' : 'Visual search failed');
      }
    } catch {
      toast.error(language === 'ar' ? 'فشل البحث البصري' : language === 'fr' ? 'Échec de la recherche visuelle' : 'Visual search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVisualSearch = async (imgUrl: string, productId?: string) => {
    setLoading(true);
    setUploadedImage(imgUrl);
    setVisualSearchActive(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info(language === 'ar' ? 'البحث عن منتجات مماثلة...' : language === 'fr' ? 'Recherche de produits similaires...' : 'Finding similar products...');
    try {
      const res = await apiSearchVisualUrl(imgUrl, productId) as any;
      if (res.success) {
        setProducts(res.products);
        setTotal(res.products.length);
        toast.success(
          language === 'ar' ? `تم العثور على ${res.products.length} منتج مشابه` :
          language === 'fr' ? `${res.products.length} produits similaires trouvés` :
          `Found ${res.products.length} similar products`
        );
      } else {
        toast.error(language === 'ar' ? 'فشل البحث البصري' : language === 'fr' ? 'Échec de la recherche visuelle' : 'Visual search failed');
      }
    } catch {
      toast.error(language === 'ar' ? 'فشل البحث البصري' : language === 'fr' ? 'Échec de la recherche visuelle' : 'Visual search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const { sessionId } = await apiCreateSearchSession({ q: query, category, storeId: selectedStore, sortBy, priceOnly, showDuplicates, uploadedImage });
      const shareUrl = `${window.location.origin}${window.location.pathname}?s=${sessionId}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success(language === 'ar' ? 'تم نسخ الرابط إلى الحافظة!' : language === 'fr' ? 'Lien copié dans le presse-papiers !' : 'Link copied to clipboard!');
    } catch { 
      toast.error(language === 'ar' ? 'فشل في إنشاء رابط المشاركة' : language === 'fr' ? 'Échec de la génération du lien de partage' : 'Failed to generate share link'); 
    }
  };

  const selectedStoreName = stores.find(s => s._id === selectedStore)?.name || (language === 'ar' ? 'جميع المتاجر' : language === 'fr' ? 'Toutes les boutiques' : 'All stores');

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* ── Top search bar ── */}
      <div className="bg-white border-b border-[#E8E8E8] px-4 py-3 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-gray-200 transition-colors shrink-0"
          >
            <Home size={18} />
          </button>

          {/* Image upload thumbnail */}
          <div className="w-9 h-9 shrink-0 relative">
            {uploadedImage ? (
              <div className="w-full h-full relative">
                <img src={uploadedImage} className="w-full h-full rounded-lg object-cover" alt="Search" />
                <button
                  onClick={handleClearImage}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center"
                >
                  <X size={8} className="text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-200 border border-dashed border-gray-300"
              >
                <ImagePlus size={16} />
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          {/* Text input */}
          <div className="flex-1 flex items-center bg-gray-100 border border-[#E2E8F0] rounded-lg px-3 py-2 gap-2">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder={t.search.placeholder}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="bg-transparent outline-none text-sm flex-1 text-[#333] placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-[#E85D04] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity shrink-0"
          >
            {t.nav.search}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#555] hover:bg-gray-50 shrink-0"
          >
            <Share2 size={15} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* ── Filters bar ── */}
        <div className="bg-white border border-[#E8E8E8] rounded-lg px-4 py-3 mb-5 flex flex-wrap items-center gap-3">
          {/* Store filter */}
          <div className="relative">
            <button
              onClick={() => setShowStoreDropdown(!showStoreDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-[#E2E8F0] rounded-lg text-sm text-[#555] hover:border-[#E85D04] transition-colors"
            >
              <StoreIcon size={14} className="text-[#E85D04]" />
              <span className="max-w-[120px] truncate">{selectedStoreName}</span>
              <ChevronDown size={13} className={`text-gray-400 transition-transform ${showStoreDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showStoreDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto py-1 min-w-[180px]">
                <button onClick={() => { setSelectedStore(''); setShowStoreDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-[#333] hover:bg-gray-50">
                  {language === 'ar' ? 'جميع المتاجر' : language === 'fr' ? 'Toutes les boutiques' : 'All stores'}
                </button>
                {stores.map(s => (
                  <button key={s._id} onClick={() => { setSelectedStore(s._id); setShowStoreDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-[#333] hover:bg-gray-50">
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category filter */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-[#E2E8F0] rounded-lg text-sm text-[#555] hover:border-[#E85D04] transition-colors"
            >
              <LayoutGrid size={14} className="text-[#E85D04]" />
              <span className="max-w-[120px] truncate">
                {category ? getLocalizedCategoryName(category) : (language === 'ar' ? 'جميع الفئات' : language === 'fr' ? 'Toutes les catégories' : 'All categories')}
              </span>
              <ChevronDown size={13} className={`text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto py-1 min-w-[180px]">
                <button 
                  onClick={() => { 
                    setCategory(''); 
                    setShowCategoryDropdown(false);
                    const p = new URLSearchParams(searchParams);
                    p.delete('category');
                    setSearchParams(p);
                  }} 
                  className="w-full text-left px-4 py-2 text-sm text-[#333] hover:bg-gray-50"
                >
                  {language === 'ar' ? 'جميع الفئات' : language === 'fr' ? 'Toutes les catégories' : 'All categories'}
                </button>
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => { 
                      setCategory(c.name); 
                      setShowCategoryDropdown(false);
                      const p = new URLSearchParams(searchParams);
                      p.set('category', c.name);
                      setSearchParams(p);
                    }} 
                    className="w-full text-left px-4 py-2 text-sm text-[#333] hover:bg-gray-50"
                  >
                    {getLocalizedCategoryName(c.name)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 bg-gray-50 border border-[#E2E8F0] rounded-lg text-sm text-[#555] focus:outline-none focus:border-[#E85D04] cursor-pointer"
            >
              <option value="newest">{language === 'ar' ? 'الأحدث' : language === 'fr' ? 'Plus récent' : 'Newest'}</option>
              <option value="oldest">{language === 'ar' ? 'الأقدم' : language === 'fr' ? 'Plus ancien' : 'Oldest'}</option>
              <option value="priceAsc">{language === 'ar' ? 'السعر ↑' : language === 'fr' ? 'Prix ↑' : 'Price ↑'}</option>
              <option value="priceDesc">{language === 'ar' ? 'السعر ↓' : language === 'fr' ? 'Prix ↓' : 'Price ↓'}</option>
              <option value="trending">{language === 'ar' ? 'شائع' : language === 'fr' ? 'Populaire' : 'Popular'}</option>
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Price only */}
          <button
            onClick={() => setPriceOnly(!priceOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm transition-colors ${priceOnly ? 'bg-[#FFF0E6] border-[#E85D04] text-[#E85D04]' : 'bg-gray-50 border-[#E2E8F0] text-[#555]'}`}
          >
            <Tag size={13} />
            {language === 'ar' ? 'بالسعر فقط' : language === 'fr' ? 'Avec Prix' : 'With Price'}
          </button>

          {/* Duplicates */}
          <button
            onClick={() => setShowDuplicates(!showDuplicates)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm transition-colors ${showDuplicates ? 'bg-[#FFF0E6] border-[#E85D04] text-[#E85D04]' : 'bg-gray-50 border-[#E2E8F0] text-[#555]'}`}
          >
            <Copy size={13} />
            {language === 'ar' ? 'تكرار' : language === 'fr' ? 'Doubles' : 'Duplicates'}
          </button>

          <span className="ml-auto text-sm text-[#888]">
            {total.toLocaleString()} {language === 'ar' ? 'نتائج' : language === 'fr' ? 'résultats' : 'results'}
          </span>
        </div>

        {/* ── Product grid ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 size={36} className="text-[#E85D04] animate-spin mb-3" />
            <p className="text-[#888] text-sm">
              {language === 'ar' ? 'جاري فحص كتالوجات الموردين...' : language === 'fr' ? 'Analyse des catalogues grossistes...' : 'Scanning supplier catalogs...'}
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E8E8E8] p-20 text-center">
            <Search size={40} className="mx-auto mb-4 text-[#CCC]" />
            <h3 className="text-lg font-bold text-[#333] mb-2">{t.search.noProducts}</h3>
            <p className="text-sm text-[#888]">{t.search.tryDifferent}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {products.map((product, idx) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isFav={isFavorite(product._id)}
                  onFavorite={() => handleFavorite(product._id)}
                  onVisualSearch={() => handleVisualSearch(product.imageUrl, product._id)}
                  onClick={() => setSelectedProductIndex(idx)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {(() => {
              const limit = 40;
              const totalPages = Math.ceil(total / limit);
              if (totalPages <= 1) return null;

              // Calculate sliding window of max 8 pages
              let startPage = 1;
              let endPage = totalPages;
              if (totalPages > 8) {
                if (page <= 5) {
                  startPage = 1;
                  endPage = 8;
                } else if (page + 3 >= totalPages) {
                  startPage = totalPages - 7;
                  endPage = totalPages;
                } else {
                  startPage = page - 4;
                  endPage = page + 3;
                }
              }

              const pageNumbers = [];
              for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
              }

              return (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-8 py-6">
                  {/* Prev Button */}
                  <button
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="w-10 h-10 rounded-lg border border-[#E2E8F0] bg-white flex items-center justify-center text-gray-500 hover:border-[#E85D04] hover:text-[#E85D04] disabled:opacity-50 disabled:pointer-events-none hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Page numbers */}
                  {pageNumbers.map(n => (
                    <button
                      key={n}
                      onClick={() => handlePageChange(n)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 ${
                        page === n
                          ? 'bg-[#E85D04] text-white shadow-md shadow-[#E85D04]/20'
                          : 'bg-white border border-[#E2E8F0] text-[#555] hover:border-[#E85D04] hover:text-[#E85D04]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    disabled={page === totalPages}
                    onClick={() => handlePageChange(page + 1)}
                    className="w-10 h-10 rounded-lg border border-[#E2E8F0] bg-white flex items-center justify-center text-gray-500 hover:border-[#E85D04] hover:text-[#E85D04] disabled:opacity-50 disabled:pointer-events-none hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              );
            })()}
          </>
        )
      }
      </div>

      {/* Product detail modal */}
      {selectedProductIndex !== null && (
        <ProductDetailModal
          products={products}
          activeIndex={selectedProductIndex}
          onClose={() => setSelectedProductIndex(null)}
          onSelectProduct={(index) => setSelectedProductIndex(index)}
          onVisualSearch={(prod) => {
            setSelectedProductIndex(null);
            handleVisualSearch(prod.imageUrl, prod._id);
          }}
        />
      )}
    </div>
  );
}
