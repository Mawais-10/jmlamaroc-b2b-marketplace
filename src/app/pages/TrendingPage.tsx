import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Radio, TrendingUp, Search as SearchIcon, Loader2, Heart } from 'lucide-react';
import { apiGetProducts, ApiProduct } from '../services/api';

const TIME_FILTERS = [
  { label: '3 days', days: 3 },
  { label: '7 days', days: 7 },
  { label: '14 days', days: 14 },
  { label: '30 days', days: 30 },
];

const HOT_CATEGORIES = [
  { name: 'Shoes', count: '+7404' },
  { name: 'Women\'s Clothing', count: '+3196' },
  { name: 'Bags & Wallets', count: '+1906' },
  { name: 'Perfume', count: '+1529' },
  { name: 'Jewelry & Watches', count: '+1336' },
  { name: 'Hair Care', count: '+1150' },
  { name: 'Skincare', count: '+1001' },
  { name: 'Sports & Fitness', count: '+701' },
  { name: 'Automotive', count: '+629' },
  { name: 'Baby Products', count: '+574' },
];

export default function TrendingPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [activeCategory, setActiveCategory] = useState('All');

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
            <h1 className="text-3xl font-bold text-[#111827]">Trend Radar</h1>
          </div>
          <p className="text-[#6B7280] text-lg mb-8">Products trending across suppliers right now</p>

          <div className="flex gap-3">
            {TIME_FILTERS.map(f => (
              <button
                key={f.days}
                onClick={() => setDays(f.days)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all border ${
                  days === f.days 
                    ? 'bg-[#1A7A5E] text-white border-[#1A7A5E]' 
                    : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#1A7A5E]'
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
                <h3 className="font-bold text-[#111827]">Hot Categories</h3>
              </div>
              <div className="p-2">
                {['All', ...HOT_CATEGORIES.map(c => c.name)].map(catName => {
                  const hotCat = HOT_CATEGORIES.find(hc => hc.name === catName);
                  return (
                    <button
                      key={catName}
                      onClick={() => setActiveCategory(catName)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        activeCategory === catName 
                          ? 'bg-[#F0FDF4] text-[#1A7A5E]' 
                          : 'text-[#4B5563] hover:bg-gray-50'
                      }`}
                    >
                      <span>{catName}</span>
                      {hotCat && (
                        <span className={`text-xs ${activeCategory === catName ? 'text-[#1A7A5E]' : 'text-[#9CA3AF]'}`}>
                          {hotCat.count}
                        </span>
                      )}
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
                {products.length} trending products
              </h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 size={40} className="text-[#1A7A5E] animate-spin mb-4" />
                <p className="text-[#6B7280] font-medium">Analyzing market trends...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp size={32} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-[#111827] mb-2">No trending data for this period</h3>
                <p className="text-[#6B7280]">Try selecting a longer time range or another category.</p>
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
                        <div className="px-2 py-1 bg-[#F0FDF4] text-[#1A7A5E] text-[10px] font-bold rounded uppercase">
                          {product.price ? `${product.price} ${product.currency}` : 'Price on request'}
                        </div>
                        <div className="text-[11px] text-[#6B7280] flex items-center gap-1">
                          <Heart size={10} fill="#9CA3AF" stroke="none" />
                          <span>{product.favoriteCount || 0} likes</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => navigate(`/groups/${product.storeHandle}`)}
                        className="text-sm font-bold text-[#111827] hover:text-[#1A7A5E] transition-colors mb-2 block text-left"
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
                          className="flex items-center gap-1.5 text-xs font-bold text-[#1A7A5E] hover:underline"
                        >
                          <SearchIcon size={14} />
                          Find Suppliers
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
