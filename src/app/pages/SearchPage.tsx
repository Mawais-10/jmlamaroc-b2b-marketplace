import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { 
  Search, ImagePlus, Heart, X, ChevronDown, Zap, Loader2, 
  Home, Share2, Tag, Copy, LayoutGrid, Store as StoreIcon,
  CheckCircle2, AlertCircle, ArrowRight, Image as ImageIcon,
  Send, Shield
} from 'lucide-react';
import { 
  apiGetProducts, apiGetStores, apiCreateSearchSession, apiGetSearchSession,
  apiSearchVisual, apiSearchVisualUrl, ApiProduct, ApiStore 
} from '../services/api';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isFavorite, addFavorite, removeFavorite } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [selectedStore, setSelectedStore] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceOnly, setPriceOnly] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(searchParams.get('img') || null);
  
  const [stores, setStores] = useState<ApiStore[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);

  // Restore session from ?s= ID
  useEffect(() => {
    const sessionId = searchParams.get('s');
    if (sessionId) {
      const loadSession = async () => {
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
          toast.success('Search feed restored from shared link');
        } catch (err) {
          console.error('Failed to restore session', err);
        }
      };
      loadSession();
    }
  }, [searchParams]);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await apiGetStores({ limit: '100', sort: 'nameAsc' });
      setStores(res.stores);
    } catch (err) {
      console.error('Failed to fetch stores', err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = { 
        sort: sortBy,
        q: query,
        category: category,
        storeId: selectedStore,
        priceOnly: priceOnly ? 'true' : 'false'
      };

      const res = await apiGetProducts(params);
      setProducts(res.products);
      setTotal(res.total);
    } catch (err) {
      console.error('Product load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [query, category, selectedStore, sortBy, priceOnly]);

  const handleSearch = () => {
    const p = new URLSearchParams(searchParams);
    if (query) p.set('q', query); else p.delete('q');
    setSearchParams(p);
  };

  const handleFavorite = (productId: string) => {
    if (!user) { navigate('/login?redirect=/search'); return; }
    if (isFavorite(productId)) { 
      removeFavorite(productId); 
      toast.success('Removed from favorites'); 
    } else { 
      addFavorite(productId); 
      toast.success('Added to favorites!'); 
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setUploadedImage(URL.createObjectURL(file));
    toast.info('AI is analyzing your image...');

    try {
      const res = await apiSearchVisual(file);
      if (res.success) {
        setProducts(res.products);
        setTotal(res.products.length);
        toast.success('Visual search complete!');
      } else {
        toast.error('Visual search failed');
      }
    } catch (err) {
      console.error('Visual search error:', err);
      toast.error('Visual search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVisualSearch = async (imgUrl: string) => {
    setLoading(true);
    setUploadedImage(imgUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info('Finding similar products...');

    try {
      const res = await apiSearchVisualUrl(imgUrl);
      if (res.success) {
        setProducts(res.products);
        setTotal(res.products.length);
        toast.success('Visual search complete!');
      } else {
        toast.error('Visual search failed');
      }
    } catch (err) {
      console.error('Visual search error:', err);
      toast.error('Visual search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const { sessionId } = await apiCreateSearchSession({
        q: query,
        category,
        storeId: selectedStore,
        sortBy,
        priceOnly,
        showDuplicates,
        uploadedImage
      });
      
      const shareUrl = `${window.location.origin}${window.location.pathname}?s=${sessionId}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('Professional search link generated!', {
        description: 'The link has been copied to your clipboard.'
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate share link');
    }
  };

  const selectedStoreName = stores.find(s => s._id === selectedStore)?.name || 'All stores';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Search Status Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4">
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-3 shadow-sm flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="w-12 h-12 bg-[#F1F5F9] rounded-2xl flex items-center justify-center text-[#64748B] hover:bg-[#E2E8F0] transition-colors"
          >
            <Home size={22} />
          </button>
          
          <div className="w-12 h-12 relative group">
            {uploadedImage ? (
              <div className="w-full h-full relative">
                <img src={uploadedImage} className="w-full h-full rounded-2xl object-cover" alt="Search Target" />
                <button 
                  onClick={() => setUploadedImage(null)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] border-2 border-white rounded-full flex items-center justify-center"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => fileRef.current?.click()}
                className="w-full h-full bg-[#F1F5F9] rounded-2xl flex items-center justify-center text-[#94A3B8] hover:bg-[#E2E8F0] transition-colors border-2 border-dashed border-[#CBD5E1]"
              >
                <ImagePlus size={20} />
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          <div className="flex-1 bg-[#F1F5F9]/50 border border-[#E2E8F0] rounded-2xl px-5 py-3 flex items-center gap-3">
            <ImageIcon size={18} className={uploadedImage ? 'text-[#1A7A5E]' : 'text-[#94A3B8]'} />
            <span className={`text-sm font-medium ${uploadedImage ? 'text-[#1A7A5E]' : 'text-[#64748B]'}`}>
              {uploadedImage ? 'Image search mode' : 'Text search mode'}
            </span>
            <span className="text-sm text-[#94A3B8]">
              {uploadedImage ? ' - Remove image to search by text' : ' - Type keywords or upload an image'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl px-4 py-2.5 flex items-center gap-2">
              <Search size={18} className="text-[#94A3B8]" />
              <input 
                type="text" 
                placeholder="Search keywords..." 
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="bg-transparent outline-none text-sm w-40"
              />
            </div>
            <button 
              onClick={handleSearch}
              className="bg-[#1A7A5E] text-white px-8 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Search size={18} />
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Results Info */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] px-6 py-4 mb-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 text-[#1E293B]">
            <ImageIcon size={20} className="text-[#1A7A5E]" />
            <span className="text-lg font-bold">{total} results</span>
          </div>
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-[#F1F5F9] text-[#64748B] text-sm font-bold rounded-xl hover:bg-[#E2E8F0] transition-colors"
          >
            <Share2 size={16} />
            Share
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-1 mb-8 shadow-sm flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#F1F5F9]">
          {/* Store Filter */}
          <div className="flex-1 p-3">
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase px-3 mb-1 flex items-center gap-1.5">
              <StoreIcon size={12} /> Store
            </label>
            <div className="relative">
              <button 
                onClick={() => setShowStoreDropdown(!showStoreDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] hover:border-[#1A7A5E] transition-all"
              >
                <span className="truncate">{selectedStoreName}</span>
                <ChevronDown size={16} className={`transition-transform ${showStoreDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showStoreDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto py-2">
                  <button 
                    onClick={() => { setSelectedStore(''); setShowStoreDropdown(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-[#1E293B]"
                  >
                    <StoreIcon size={14} className="text-[#94A3B8]" />
                    All stores
                  </button>
                  {stores.map(s => (
                    <button 
                      key={s._id}
                      onClick={() => { setSelectedStore(s._id); setShowStoreDropdown(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-[#1E293B]"
                    >
                      <StoreIcon size={14} className="text-[#94A3B8]" />
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sort Filter */}
          <div className="flex-1 p-3">
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase px-3 mb-1 flex items-center gap-1.5">
              <LayoutGrid size={12} /> Sort By
            </label>
            <div className="relative">
              <select 
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full appearance-none px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] focus:outline-none focus:border-[#1A7A5E] cursor-pointer"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="trending">Most popular</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
            </div>
          </div>

          {/* Duplicates Toggle */}
          <div className="flex-1 p-3">
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase px-3 mb-1 flex items-center gap-1.5">
              <Copy size={12} /> Show Duplicates
            </label>
            <button 
              onClick={() => setShowDuplicates(!showDuplicates)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-medium transition-all"
            >
              <Copy size={16} className={showDuplicates ? 'text-[#1A7A5E]' : 'text-[#94A3B8]'} />
              <span className={showDuplicates ? 'text-[#1E293B]' : 'text-[#94A3B8]'}>
                {showDuplicates ? 'On' : 'Off'}
              </span>
            </button>
          </div>

          {/* Price Only Toggle */}
          <div className="flex-1 p-3">
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase px-3 mb-1 flex items-center gap-1.5">
              <Tag size={12} /> With Price Only
            </label>
            <button 
              onClick={() => setPriceOnly(!priceOnly)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-medium transition-all"
            >
              <Tag size={16} className={priceOnly ? 'text-[#1A7A5E]' : 'text-[#94A3B8]'} />
              <span className={priceOnly ? 'text-[#1E293B]' : 'text-[#94A3B8]'}>
                {priceOnly ? 'On' : 'Off'}
              </span>
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 size={40} className="text-[#1A7A5E] animate-spin mb-4" />
            <p className="text-[#64748B] font-medium">Scanning supplier catalogs...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-20 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={40} className="text-[#CBD5E1]" />
            </div>
            <h3 className="text-xl font-bold text-[#1E293B] mb-2">No products found</h3>
            <p className="text-[#64748B]">Try a different keyword or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product._id} className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden hover:shadow-2xl transition-all group shadow-sm flex flex-col h-full">
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img src={product.imageUrl} alt={product.description} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleFavorite(product._id); }}
                    className="absolute top-4 right-4 p-2.5 rounded-2xl bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-all z-10"
                  >
                    <Heart size={18} fill={isFavorite(product._id) ? '#EF4444' : 'none'} stroke={isFavorite(product._id) ? '#EF4444' : '#64748B'} />
                  </button>
                  {product.price && (
                    <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-[#EF4444] text-white text-[10px] font-bold rounded-xl shadow-lg uppercase">
                      Best Price
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <button 
                      onClick={() => navigate(`/groups/${product.storeHandle}`)}
                      className="text-xs font-bold text-[#64748B] hover:text-[#1A7A5E] transition-colors"
                    >
                      @{product.storeHandle}
                    </button>
                    <span className="text-[10px] text-[#94A3B8]">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-[#1E293B] line-clamp-1 mb-2 group-hover:text-[#1A7A5E] transition-colors">
                    {product.storeName}
                  </h4>
                  <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                    {product.description || product.title}
                  </p>
                  
                  {product.price ? (
                    <p className="text-base font-bold text-[#1A7A5E] mt-3">{product.price} {product.currency}</p>
                  ) : (
                    <p className="text-xs text-[#94A3B8] font-medium italic mt-3">Price on request</p>
                  )}
                </div>

                {/* Card Footer with Search and Telegram */}
                <div className="grid grid-cols-2 border-t border-[#F1F5F9] divide-x divide-[#F1F5F9]">
                  <button 
                    onClick={() => handleVisualSearch(product.imageUrl)}
                    className="flex items-center justify-center py-3.5 hover:bg-[#F8FAFC] transition-colors group/btn"
                  >
                    <Search size={18} className="text-[#1A7A5E] group-hover/btn:scale-110 transition-transform" />
                  </button>
                  <a 
                    href={`https://t.me/${product.storeHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center py-3.5 hover:bg-[#F8FAFC] transition-colors group/btn"
                  >
                    <Send size={18} className="text-[#229ED9] group-hover/btn:scale-110 transition-transform" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

