import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { 
  Search, ChevronDown, ChevronRight, Image as ImageIcon, Users, 
  Send, MessageCircle, X, Plus, Layers, Loader2, ArrowRight
} from 'lucide-react';
import { CATEGORIES, Category } from '../data/mockData';
import { apiGetStores, ApiStore } from '../services/api';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';

type SortOption = 'mostProducts' | 'leastProducts' | 'nameAsc' | 'nameDesc';

const SORT_LABELS: Record<SortOption, string> = {
  mostProducts: 'Most products',
  leastProducts: 'Least products',
  nameAsc: 'Name A — Z',
  nameDesc: 'Name Z — A',
};

const MAIN_CATEGORIES = [
  { id: 'all', name: 'All', icon: Layers },
  { id: 'furniture', name: 'Furniture', icon: Layers },
  { id: 'fashion', name: 'Fashion', icon: Layers },
  { id: 'home-decor', name: 'Home Decor', icon: Layers },
  { id: 'kitchen', name: 'Kitchen & Dining', icon: Layers },
  { id: 'electronics', name: 'Electronics', icon: Layers },
  { id: 'beauty', name: 'Beauty', icon: Layers },
  { id: 'kids', name: 'Kids & Babies', icon: Layers },
  { id: 'home-living', name: 'Home & Living', icon: Layers },
];

export default function GroupsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const { t, language } = useTranslation();

  const SORT_LABELS: Record<SortOption, string> = {
    mostProducts: language === 'ar' ? 'الأكثر منتجات' : language === 'fr' ? 'Plus de produits' : 'Most products',
    leastProducts: language === 'ar' ? 'الأقل منتجات' : language === 'fr' ? 'Moins de produits' : 'Least products',
    nameAsc: language === 'ar' ? 'الاسم أ — ي' : language === 'fr' ? 'Nom A — Z' : 'Name A — Z',
    nameDesc: language === 'ar' ? 'الاسم ي — أ' : language === 'fr' ? 'Nom Z — A' : 'Name Z — A',
  };

  const MAIN_CATEGORIES = [
    { id: 'all', name: language === 'ar' ? 'الكل' : language === 'fr' ? 'Tout' : 'All', icon: Layers },
    { id: 'furniture', name: language === 'ar' ? 'الأثاث' : language === 'fr' ? 'Meubles' : 'Furniture', icon: Layers },
    { id: 'fashion', name: language === 'ar' ? 'موضة' : language === 'fr' ? 'Mode' : 'Fashion', icon: Layers },
    { id: 'home-decor', name: language === 'ar' ? 'ديكور منزلي' : language === 'fr' ? 'Décoration' : 'Home Decor', icon: Layers },
    { id: 'kitchen', name: language === 'ar' ? 'المطبخ والمائدة' : language === 'fr' ? 'Cuisine & Salle' : 'Kitchen & Dining', icon: Layers },
    { id: 'electronics', name: language === 'ar' ? 'الإلكترونيات' : language === 'fr' ? 'Électronique' : 'Electronics', icon: Layers },
    { id: 'beauty', name: language === 'ar' ? 'العناية والتجميل' : language === 'fr' ? 'Beauté' : 'Beauty', icon: Layers },
    { id: 'kids', name: language === 'ar' ? 'الأطفال والرضع' : language === 'fr' ? 'Enfants & Bébés' : 'Kids & Babies', icon: Layers },
    { id: 'home-living', name: language === 'ar' ? 'المنزل والمعيشة' : language === 'fr' ? 'Maison & Jardin' : 'Home & Living', icon: Layers },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('mostProducts');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [stores, setStores] = useState<ApiStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const loadStores = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { sort: sortBy };
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory && selectedCategory !== 'all') {
        const cat = CATEGORIES.find(c => c.id === selectedCategory)
          || CATEGORIES.flatMap(c => c.subcategories || []).find(c => c.id === selectedCategory);
        if (cat) params.category = cat.name;
        else params.category = selectedCategory; // Handle custom or slugified names
      }
      const res = await apiGetStores(params);
      setStores(res.stores);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load stores', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, selectedCategory]);

  useEffect(() => {
    const t = setTimeout(loadStores, 300);
    return () => clearTimeout(t);
  }, [loadStores]);

  const selectCategory = (id: string) => {
    setSelectedCategory(id);
    const params = new URLSearchParams();
    if (id !== 'all') params.set('category', id);
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-[#64748B] text-lg mb-1">{t.store.browseAll}</h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm sticky top-8">
              <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center gap-2 bg-[#F8FAFC]">
                <Layers size={18} className="text-[#E85D04]" />
                <h3 className="font-bold text-[#1E293B]">{t.store.categories}</h3>
              </div>
              <div className="p-2">
                {MAIN_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => selectCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      selectedCategory === cat.id 
                        ? 'bg-[#F0FDF4] text-[#E85D04] shadow-sm' 
                        : 'text-[#64748B] hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {selectedCategory === cat.id ? <div className="w-1.5 h-6 bg-[#E85D04] rounded-full absolute left-2" /> : null}
                      <span>{cat.name}</span>
                    </div>
                  </button>
                ))}
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-[#64748B] hover:bg-gray-50">
                  <span>{t.store.more}</span>
                  <ChevronDown size={14} className="text-[#94A3B8]" />
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search + Sort */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
              <div className="relative flex-1 w-full">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={language === 'ar' ? 'البحث عن المتاجر...' : language === 'fr' ? 'Rechercher des boutiques...' : 'Search stores...'}
                  className="w-full bg-white border border-[#E2E8F0] rounded-2xl pl-12 pr-4 py-3.5 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#E85D04]/20 focus:border-[#E85D04] transition-all shadow-sm"
                />
              </div>

              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="w-full sm:w-48 flex items-center justify-between px-5 py-3.5 bg-white border border-[#E2E8F0] rounded-2xl text-sm font-medium text-[#1E293B] shadow-sm hover:border-[#E85D04] transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-[#E85D04]" />
                    <span>{SORT_LABELS[sortBy]}</span>
                  </div>
                  <ChevronDown size={16} className={`text-[#94A3B8] transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showSortDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-full sm:w-56 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                    {(Object.keys(SORT_LABELS) as SortOption[]).map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setSortBy(opt); setShowSortDropdown(false); }}
                        className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                          sortBy === opt ? 'bg-[#E85D04] text-white' : 'text-[#64748B] hover:bg-gray-50'
                        }`}
                      >
                        <Layers size={14} className={sortBy === opt ? 'text-white' : 'text-[#E85D04]'} />
                        {SORT_LABELS[opt]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="text-[#64748B] text-sm mb-6">
              {total} {language === 'ar' ? 'متاجر متاحة' : language === 'fr' ? 'boutiques disponibles' : 'stores available'} · Page 1/{Math.ceil(total / 50) || 1}
            </p>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 size={40} className="text-[#E85D04] animate-spin mb-4" />
                <p className="text-[#64748B] font-medium">
                  {language === 'ar' ? 'جاري العثور على أفضل الموردين...' : language === 'fr' ? 'Recherche des meilleurs fournisseurs...' : 'Finding best suppliers...'}
                </p>
              </div>
            ) : stores.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E2E8F0] p-16 text-center shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Layers size={40} className="text-[#CBD5E1]" />
                </div>
                <h3 className="text-xl font-bold text-[#1E293B] mb-2">
                  {language === 'ar' ? 'لم يتم العثور على أي متجر' : language === 'fr' ? 'Aucune boutique trouvée' : 'No stores found'}
                </h3>
                <p className="text-[#64748B] mb-8">
                  {language === 'ar' ? 'لم نتمكن من العثور على أي متجر يطابق معايير البحث الخاصة بك.' : language === 'fr' ? 'Nous n\'avons trouvé aucune boutique correspondant à vos critères.' : 'We couldn\'t find any stores matching your criteria.'}
                </p>
                <button onClick={() => { setSearchQuery(''); selectCategory('all'); }} className="text-[#E85D04] font-bold hover:underline">
                  {language === 'ar' ? 'إعادة ضبط التصفية' : language === 'fr' ? 'Réinitialiser les filtres' : 'Clear all filters'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {stores.map(store => (
                  <div
                    key={store._id}
                    onClick={() => navigate(`/groups/${store.handle}`)}
                    className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden hover:shadow-2xl hover:border-[#E85D04] transition-all cursor-pointer group flex flex-col h-full shadow-sm"
                  >
                    {/* Preview Image (Single) */}
                    <div className="h-44 bg-gray-50 overflow-hidden">
                      {store.previewProducts && store.previewProducts.length > 0 ? (
                        <img 
                          src={store.previewProducts[0]?.imageUrl} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          alt="" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC]">
                          <ImageIcon size={32} className="text-[#CBD5E1]" />
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-[#1E293B] group-hover:text-[#E85D04] transition-colors line-clamp-1">
                          {store.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          {store.telegramLink && <Send size={14} className="text-[#229ED9]" />}
                          {store.whatsappLink && <MessageCircle size={14} className="text-[#25D366]" />}
                        </div>
                      </div>
                      <p className="text-xs text-[#94A3B8] mb-4">@{store.handle}</p>

                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B]">
                          <ImageIcon size={14} />
                          <span>{store.productCount.toLocaleString()} {t.store.images}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B]">
                          <Users size={14} />
                          <span>{store.followerCount.toLocaleString()} {t.store.subscribers}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                        <span className="text-xs font-bold text-[#E85D04] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          {t.landing.viewStore} <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
