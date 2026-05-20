import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { 
  Search, ImagePlus, Shield, Zap, Users, Package, CheckCircle, 
  ArrowRight, Star, UserPlus 
} from 'lucide-react';
import { DEMO_SEARCH_RESULTS, WHATSAPP_BECOME_SUPPLIER_URL, CATEGORIES } from '../data/mockData';
import { apiGetStores, ApiStore } from '../services/api';

// Category icons — SVG paths for each category
const CATEGORY_ICONS: Record<string, JSX.Element> = {
  'Women\'s Clothing': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M12 2c-1.5 0-3 1-3 3v1L6 8v4h12V8l-3-2V5c0-2-1.5-3-3-3z" />
      <path d="M6 12v8a1 1 0 001 1h10a1 1 0 001-1v-8" />
    </svg>
  ),
  Shoes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M2 16l2-8h6l2 4h8a1 1 0 011 1v2a2 2 0 01-2 2H3a1 1 0 01-1-1v-1z" />
      <circle cx="6" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" />
    </svg>
  ),
  Jewelry: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Bags: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  'Men\'s Clothing': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H7v10a1 1 0 001 1h8a1 1 0 001-1V10h3.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" />
    </svg>
  ),
  Perfume: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M9 3h6v4H9z" /><rect x="6" y="7" width="12" height="14" rx="2" />
      <path d="M12 3V1" /><path d="M9.5 2.5c0-1 1-1.5 2.5-1.5s2.5.5 2.5 1.5" />
    </svg>
  ),
  'Kitchen Tools': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
      <line x1="7" y1="2" x2="7" y2="11" />
      <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
    </svg>
  ),
  Skincare: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  'Kids\' Clothing': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <circle cx="12" cy="5" r="3" />
      <path d="M6 9l-2 13h16L18 9l-3 3-3-2-3 2-3-3z" />
    </svg>
  ),
  'Kitchen Appliances': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  ),
  'Hair Care': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M9 12a4 4 0 104 4V4a5 5 0 00-3 4.5" />
      <path d="M6 20a4 4 0 004-4" />
    </svg>
  ),
  Bathroom: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M9 6l-5 5h18" />
      <path d="M4 11v6a2 2 0 002 2h12a2 2 0 002-2v-6" />
      <path d="M4 15h16" />
    </svg>
  ),
  Bedding: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M2 9h20v12H2z" /><path d="M2 9V6a2 2 0 012-2h16a2 2 0 012 2v3" />
      <path d="M2 13h20" />
    </svg>
  ),
  Automotive: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h11l5 5v5a2 2 0 01-2 2h-2" />
      <circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  ),
  default: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
};

const LANDING_CATEGORIES = [
  { id: 'womens-clothing', name: "Women's Clothing" },
  { id: 'shoes', name: 'Shoes' },
  { id: 'jewelry', name: 'Jewelry' },
  { id: 'bags', name: 'Bags' },
  { id: 'mens-clothing', name: "Men's Clothing" },
  { id: 'perfume', name: 'Perfume' },
  { id: 'kitchen-tools', name: 'Kitchen Tools' },
  { id: 'skincare', name: 'Skincare' },
  { id: 'kids-clothing', name: "Kids' Clothing" },
  { id: 'kitchen-appliances', name: 'Kitchen Appliances' },
  { id: 'hair-care', name: 'Hair Care' },
  { id: 'bathroom', name: 'Bathroom' },
  { id: 'bedding', name: 'Bedding' },
  { id: 'automotive', name: 'Automotive' },
];

const DEMO_PRODUCTS = [
  { query: 'Summer Dress', img: 'https://images.unsplash.com/photo-1777292296715-706dd0b73305?w=120&q=80' },
  { query: 'Leather Handbag', img: 'https://images.unsplash.com/photo-1760624295064-2de890f64524?w=120&q=80' },
  { query: 'Wireless Earbuds', img: 'https://images.unsplash.com/photo-1591869754715-5f679687039c?w=120&q=80' },
];

export default function LandingPage() {
  const [searchText, setSearchText] = useState('');
  const [demoIndex, setDemoIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [stores, setStores] = useState<ApiStore[]>([]);
  const [totalStores, setTotalStores] = useState(0);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTopStores();
  }, []);

  const fetchTopStores = async () => {
    try {
      const res = await apiGetStores({ limit: '8', sort: 'mostProducts' });
      setStores(res.stores);
      setTotalStores(res.total);
    } catch (err) {
      console.error('Failed to fetch top stores', err);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setDemoIndex(i => (i + 1) % DEMO_PRODUCTS.length);
        setAnimating(false);
      }, 400);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    if (searchText.trim()) navigate(`/search?q=${encodeURIComponent(searchText)}`);
    else navigate('/search');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const currentDemo = DEMO_PRODUCTS[demoIndex];

  return (
    <div className="w-full">


      {/* Hero Section */}
      <section className="bg-white py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left column */}
          <div>
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border"
              style={{ backgroundColor: '#E8F5F0', color: '#1A7A5E', borderColor: '#1A7A5E' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1A7A5E' }}></span>
              Morocco's largest wholesale marketplace for retailers 🇲🇦
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-3 leading-tight">
              Got a picture of a product?
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold mb-5 leading-tight" style={{ color: '#E8820C' }}>
              We'll find every supplier who sells it
            </h2>
            <p className="text-[#444444] text-lg mb-8 leading-relaxed">
              Skip the trip to wholesale markets. Just upload an image and see every wholesaler selling the same product, with prices and direct links.
            </p>

            {/* Search bar */}
            <div className="flex items-center gap-3 border border-[#CCCCCC] rounded-xl p-2 shadow-sm mb-4 bg-white focus-within:border-[#1A7A5E] transition-colors">
              <Search size={20} className="ml-2 shrink-0 text-[#888888]" />
              <input
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by text or upload an image..."
                className="flex-1 outline-none text-[#1A1A1A] placeholder:text-[#888888] bg-transparent text-sm"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="p-2 rounded-lg hover:bg-[#E8F5F0] transition-colors"
                title="Upload image"
              >
                <ImagePlus size={20} style={{ color: '#1A7A5E' }} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={() => navigate('/search')} />
            </div>

            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-base shadow-md transition-all hover:opacity-90"
              style={{ backgroundColor: '#1A7A5E' }}
            >
              <Search size={18} />
              Search Products
            </button>
          </div>

          {/* Right column — Demo widget */}
          <div className="hidden md:block">
            <div className="bg-white rounded-2xl shadow-2xl border border-[#CCCCCC] overflow-hidden">
              {/* Browser bar */}
              <div className="bg-[#F5F5F5] border-b border-[#CCCCCC] px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-[#888888] border border-[#CCCCCC] mx-4">
                  choufliya.ma/search
                </div>
              </div>

              {/* Demo content */}
              <div className="p-5">
                {/* Header with AI label */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div style={{ backgroundColor: '#E8F5F0' }} className="px-2 py-1 rounded-full flex items-center gap-1">
                      <Zap size={12} style={{ color: '#1A7A5E' }} />
                      <span className="text-xs font-medium" style={{ color: '#1A7A5E' }}>AI-powered image analysis</span>
                    </div>
                  </div>
                  <div className="text-xs text-[#888888]" style={{ backgroundColor: '#E8F5F0', padding: '2px 8px', borderRadius: '9999px', color: '#1A7A5E' }}>
                    0.8s
                  </div>
                </div>

                {/* Searched product */}
                <div className={`flex items-center gap-3 mb-4 p-3 rounded-xl border border-[#E8F5F0] transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}
                  style={{ backgroundColor: '#E8F5F0' }}>
                  <img src={currentDemo.img} alt="searched product" className="w-14 h-14 object-cover rounded-lg" />
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">"{currentDemo.query}"</p>
                    <p className="text-xs text-[#888888]">156 results from 28 suppliers</p>
                  </div>
                </div>

                {/* Match cards */}
                <div className="space-y-3">
                  {DEMO_SEARCH_RESULTS.map((result, i) => (
                    <div
                      key={result.storeId}
                      className={`flex items-center gap-3 p-3 rounded-xl border border-[#CCCCCC] hover:border-[#1A7A5E] transition-all ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
                      style={{ transitionDelay: `${i * 50}ms` }}
                    >
                      <img src={result.imageUrl} alt={result.storeName} className="w-12 h-12 object-cover rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-sm font-semibold text-[#1A1A1A] truncate">{result.storeName}</p>
                          <span className="text-xs font-bold ml-2 shrink-0" style={{ color: result.matchScore === 100 ? '#1A7A5E' : '#E8820C' }}>
                            {result.matchScore}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-[#888888]">{result.similarProducts} similar products</p>
                          <p className="text-sm font-bold" style={{ color: '#1A7A5E' }}>{result.price} MAD</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-[#CCCCCC]" style={{ backgroundColor: '#E8F5F0' }}>
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Package, value: '1M+', label: 'Products Indexed' },
            { icon: Users, value: totalStores > 0 ? `${totalStores}+` : '100+', label: 'Wholesale Stores' },
            { icon: Zap, value: '<1s', label: 'Search Speed' },
            { icon: Shield, value: 'SSL', label: 'Account is Safe, Encrypted' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: '#1A7A5E' }}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: '#1A7A5E' }}>{value}</p>
                <p className="text-xs text-[#888888]">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-14 px-4" style={{ backgroundColor: '#F7F5F0' }}>
        <div className="max-w-6xl mx-auto">
          {/* Section heading with orange dot-grid icon */}
          <div className="flex items-center gap-3 mb-8">
            <div className="grid grid-cols-3 gap-0.5" style={{ color: '#E8820C' }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: '#E8820C' }} />
              ))}
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Browse by category</h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-3">
            {LANDING_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate(`/search?q=${encodeURIComponent(cat.name)}`)}
                className="flex flex-col items-center justify-center gap-2.5 p-4 bg-white rounded-2xl border border-[#E8E8E8] hover:border-[#1A7A5E] hover:shadow-md transition-all group"
                style={{ minHeight: '100px' }}
              >
                <div style={{ color: '#1A7A5E' }} className="group-hover:scale-110 transition-transform duration-200">
                  {CATEGORY_ICONS[cat.name] ?? CATEGORY_ICONS['default']}
                </div>
                <span className="text-xs font-medium text-center leading-tight" style={{ color: '#1A5C48' }}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sign up free as a retailer — teal banner */}
      <section className="px-4 py-6" style={{ backgroundColor: '#F7F5F0' }}>
        <div className="max-w-6xl mx-auto">
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-7 rounded-2xl"
            style={{ backgroundColor: '#1A7A5E' }}
          >
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-white mb-1.5">Sign up free as a retailer!</h3>
              <p className="text-sm" style={{ color: '#B2D8CC' }}>
                Search visually, connect directly with factories, and save favorites to build{' '}
                <br className="hidden sm:block" />
                your own supply network without middlemen.
              </p>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="shrink-0 px-6 py-3 bg-white rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm"
              style={{ color: '#1A1A1A' }}
            >
              Create free account
            </button>
          </div>
        </div>
      </section>

      {/* Featured Stores Section */}
      <section className="py-14 px-4" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">Top Wholesale Stores</h2>
              <p className="text-[#888888]">Browse from {totalStores || 163} verified supplier stores</p>
            </div>
            <button onClick={() => navigate('/groups')} className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: '#1A7A5E' }}>
              View all stores <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {stores.map(store => (
              <button
                key={store._id}
                onClick={() => navigate(`/groups/${store.handle}`)}
                className="bg-white rounded-xl overflow-hidden border border-[#CCCCCC] hover:shadow-lg hover:border-[#1A7A5E] transition-all text-left group"
              >
                <div className="relative">
                  <div className="grid grid-cols-2 h-28 bg-gray-50">
                    {store.previewProducts && store.previewProducts.length > 0 ? (
                      store.previewProducts.slice(0, 4).map((p, i) => (
                        <img key={i} src={p.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ))
                    ) : (
                      <div className="col-span-2 flex items-center justify-center text-[#CBD5E1]">
                        <Package size={24} />
                      </div>
                    )}
                  </div>
                  <div style={{ backgroundColor: '#1A7A5E' }} className="absolute bottom-2 left-2 w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow overflow-hidden">
                    {store.avatar ? (
                      <img src={store.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      store.name.charAt(0)
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-[#1A1A1A] text-sm truncate">{store.name}</p>
                  <p className="text-xs text-[#888888]">@{store.handle}</p>
                  <p className="text-xs mt-1 font-bold" style={{ color: '#1A7A5E' }}>{store.productCount.toLocaleString()} products</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">How ChouFliya Works</h2>
          <p className="text-[#888888] mb-12">Three simple steps to find your wholesale supplier</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: ImagePlus, title: 'Upload a Product Image', desc: 'Take a photo or upload any product image you want to source.' },
              { step: '2', icon: Search, title: 'AI Finds All Suppliers', desc: 'Our AI searches 1M+ products to find every wholesaler selling it.' },
              { step: '3', icon: CheckCircle, title: 'Connect & Order', desc: 'Compare prices, then contact suppliers directly via WhatsApp or Telegram.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-md" style={{ backgroundColor: '#1A7A5E' }}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className="text-xs font-bold px-3 py-1 rounded-full mb-3" style={{ backgroundColor: '#E8F5F0', color: '#1A7A5E' }}>Step {step}</div>
                <h3 className="font-bold text-[#1A1A1A] mb-2">{title}</h3>
                <p className="text-sm text-[#888888]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Supplier CTA */}
      <section className="py-14 px-4" style={{ backgroundColor: '#F7F5F0' }}>
        <div className="max-w-6xl mx-auto">
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-8 rounded-2xl"
            style={{ backgroundColor: '#1E3A30' }}
          >
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ backgroundColor: '#E8820C', color: 'white' }}>
                <Star size={12} /> For Wholesale Suppliers
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">List Your Wholesale Store</h2>
              <p className="text-sm opacity-70" style={{ color: '#E8F5F0' }}>
                Reach thousands of retailers across Morocco. Free listing, direct contact, no middlemen.
              </p>
              <div className="flex gap-5 mt-4 text-sm text-white opacity-60">
                <span>✓ Free listing</span>
                <span>✓ Direct WhatsApp contact</span>
                <span>✓ 163+ supplier stores</span>
              </div>
            </div>
            <a
              href={WHATSAPP_BECOME_SUPPLIER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity shadow-md"
              style={{ backgroundColor: '#E8820C' }}
            >
              <Star size={18} /> Become a Supplier
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div style={{ backgroundColor: '#1A7A5E' }} className="w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-lg font-bold">ChouFliya</span>
          </div>
          <p className="text-sm text-[#888888]">© 2026 ChouFliya. Morocco's largest wholesale marketplace.</p>
          <div className="flex gap-4 text-sm text-[#888888]">
            <button className="hover:text-white transition-colors">Privacy</button>
            <button className="hover:text-white transition-colors">Terms</button>
            <button className="hover:text-white transition-colors">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
