import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Radio, TrendingUp, Search as SearchIcon, Loader2, Heart } from 'lucide-react';
import { apiGetProducts, ApiProduct } from '../services/api';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';

const TIME_FILTERS = [
  { label: '3 days', days: 3 },
  { label: '7 days', days: 7 },
  { label: '14 days', days: 14 },
  { label: '30 days', days: 30 },
];

const HOT_CATEGORIES = [
  { id: 'Furniture', nameEN: 'Furniture', nameAR: 'الأثاث', nameFR: 'Meubles' },
  { id: 'Fashion', nameEN: 'Fashion', nameAR: 'موضة', nameFR: 'Mode' },
  { id: 'Home Decor', nameEN: 'Home Decor', nameAR: 'ديكور منزلي', nameFR: 'Décoration' },
  { id: 'Kitchen & Dining', nameEN: 'Kitchen & Dining', nameAR: 'المطبخ والمائدة', nameFR: 'Cuisine & Salle' },
  { id: 'Electronics', nameEN: 'Electronics', nameAR: 'الإلكترونيات', nameFR: 'Électronique' },
  { id: 'Beauty', nameEN: 'Beauty', nameAR: 'العناية والتجميل', nameFR: 'Beauté' },
  { id: 'Kids & Babies', nameEN: 'Kids & Babies', nameAR: 'الأطفال والرضع', nameFR: 'Enfants & Bébés' },
  { id: 'Home & Living', nameEN: 'Home & Living', nameAR: 'المنزل والمعيشة', nameFR: 'Maison & Jardin' },
];

export default function TrendingPage() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [activeCategory, setActiveCategory] = useState('All');

  const TIME_FILTERS = [
    { label: language === 'ar' ? '3 أيام' : language === 'fr' ? '3 jours' : '3 days', days: 3 },
    { label: language === 'ar' ? '7 أيام' : language === 'fr' ? '7 jours' : '7 days', days: 7 },
    { label: language === 'ar' ? '14 يوم' : language === 'fr' ? '14 jours' : '14 days', days: 14 },
    { label: language === 'ar' ? '30 يوم' : language === 'fr' ? '30 jours' : '30 days', days: 30 },
  ];

  useEffect(() => {
    fetchTrending();
  }, [days, activeCategory]);

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
      const dateStr = fromDate.toISOString().split('T')[0];

      const res = await apiGetProducts({
        sort: 'trending',
        fromDate: dateStr,
        limit: '20',
        ...(activeCategory !== 'All' ? { category: activeCategory } : {})
      });
      setProducts(res.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#CCCCCC] px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div style={{ backgroundColor: '#FFF7ED' }} className="p-2 rounded-xl">
              <Radio size={24} className="text-[#E8820C]" />
            </div>
            <h1 className="text-3xl font-bold text-[#111827]">
              {language === 'ar' ? 'رادار الاتجاهات' : language === 'fr' ? 'Radar des Tendances' : 'Trend Radar'}
            </h1>
          </div>
          <p className="text-[#6B7280] text-lg mb-8">
            {language === 'ar' ? 'المنتجات الرائجة لدى الموردين الآن' : language === 'fr' ? 'Produits tendance chez les fournisseurs en ce moment' : 'Products trending across suppliers right now'}
          </p>

          <div className="flex gap-3">
            {TIME_FILTERS.map(f => (
              <button
                key={f.days}
                onClick={() => setDays(f.days)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all border ${
                  days === f.days 
                    ? 'bg-[#E85D04] text-white border-[#E85D04]' 
                    : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#E85D04]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Hot Categories */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
                <TrendingUp size={18} className="text-[#E8820C]" />
                <h3 className="font-bold text-[#111827]">
                  {language === 'ar' ? 'الفئات الرائجة' : language === 'fr' ? 'Catégories Populaires' : 'Hot Categories'}
                </h3>
              </div>
              <div className="p-2">
                <button
                  onClick={() => setActiveCategory('All')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activeCategory === 'All'
                      ? 'bg-[#F0FDF4] text-[#E85D04]'
                      : 'text-[#4B5563] hover:bg-gray-50'
                  }`}
                >
                  <span>{language === 'ar' ? 'الكل' : language === 'fr' ? 'Tout' : 'All'}</span>
                </button>
                {HOT_CATEGORIES.map(cat => {
                  const localizedName = language === 'ar' ? cat.nameAR : language === 'fr' ? cat.nameFR : cat.nameEN;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        activeCategory === cat.id
                          ? 'bg-[#F0FDF4] text-[#E85D04]'
                          : 'text-[#4B5563] hover:bg-gray-50'
                      }`}
                    >
                      <span>{localizedName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#111827]">
                {products.length} {language === 'ar' ? 'منتج رائج' : language === 'fr' ? 'produits tendance' : 'trending products'}
              </h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 size={40} className="text-[#E85D04] animate-spin mb-4" />
                <p className="text-[#6B7280] font-medium">
                  {language === 'ar' ? 'جاري تحليل اتجاهات السوق...' : language === 'fr' ? 'Analyse des tendances du marché...' : 'Analyzing market trends...'}
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp size={32} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-[#111827] mb-2">
                  {language === 'ar' ? 'لا توجد بيانات رائجة لهذه الفترة' : language === 'fr' ? 'Aucune donnée tendance pour cette période' : 'No trending data for this period'}
                </h3>
                <p className="text-[#6B7280]">
                  {language === 'ar' ? 'حاول اختيار نطاق زمني أطول أو فئة أخرى.' : language === 'fr' ? 'Essayez de sélectionner une plage de temps plus longue ou une autre catégorie.' : 'Try selecting a longer time range or another category.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product._id} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-xl transition-all group">
                    <div className="relative aspect-square">
                      <img src={product.imageUrl} alt={product.description} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
                        <TrendingUp size={14} className="text-[#E8820C]" />
                        <span className="text-xs font-bold text-[#111827]">{product.favoriteCount || 0}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="px-2 py-1 bg-[#F0FDF4] text-[#E85D04] text-[10px] font-bold rounded uppercase">
                          {product.price ? `${product.price} ${product.currency}` : (language === 'ar' ? 'السعر عند الطلب' : language === 'fr' ? 'Prix sur demande' : 'Price on request')}
                        </div>
                        <div className="text-[11px] text-[#6B7280] flex items-center gap-1">
                          <Heart size={10} fill="#9CA3AF" stroke="none" />
                          <span>{product.favoriteCount || 0} {language === 'ar' ? 'إعجاب' : language === 'fr' ? 'j\'aime' : 'likes'}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => navigate(`/groups/${product.storeHandle}`)}
                        className="text-sm font-bold text-[#111827] hover:text-[#E85D04] transition-colors mb-2 block text-left"
                      >
                        @{product.storeName}
                      </button>
                      
                      <p className="text-sm text-[#4B5563] line-clamp-2 mb-4 leading-relaxed">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-[#F3F4F6]">
                        <div className="text-[11px] text-[#9CA3AF]">
                          {product.category}
                        </div>
                        <button 
                          onClick={() => navigate(`/groups/${product.storeHandle}`)}
                          className="flex items-center gap-1.5 text-xs font-bold text-[#E85D04] hover:underline"
                        >
                          <SearchIcon size={14} />
                          {language === 'ar' ? 'ابحث عن موردين' : language === 'fr' ? 'Trouver des fournisseurs' : 'Find Suppliers'}
                        </button>
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
