import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, ImagePlus, Shield, Zap, Users, Package, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { DEMO_SEARCH_RESULTS, WHATSAPP_BECOME_SUPPLIER_URL, CATEGORIES } from '../data/mockData';
import { apiGetStores, ApiStore } from '../services/api';

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
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-base shadow-md hover:opacity-90 transition-opacity"
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
      <section className="py-14 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Browse by Category</h2>
          <p className="text-[#888888] mb-8">Explore products from top wholesale stores by category</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {CATEGORIES.slice(1).map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate(`/search?category=${cat.id}`)}
                className="p-4 rounded-xl border border-[#CCCCCC] hover:border-[#1A7A5E] hover:shadow-md transition-all text-left group"
              >
                <p className="font-semibold text-[#1A1A1A] group-hover:text-[#1A7A5E] transition-colors text-sm mb-1">{cat.name}</p>
                <p className="text-xs text-[#888888]">{cat.count.toLocaleString()} products</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Stores */}
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
      <section className="py-14 px-4" style={{ backgroundColor: '#1E3A30' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Are You a Wholesale Supplier?</h2>
          <p className="text-[#E8F5F0] mb-8 opacity-80">List your store on ChouFliya and reach thousands of retailers across Morocco</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href={WHATSAPP_BECOME_SUPPLIER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#E8820C' }}
            >
              <Star size={18} /> Become a Supplier
            </a>
            <div className="flex gap-6 text-white opacity-70 text-sm">
              <span>✓ Free listing</span>
              <span>✓ Direct contact</span>
              <span>✓ 163+ stores</span>
            </div>
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
