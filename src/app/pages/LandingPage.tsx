import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Search, ImagePlus, Shield, Zap, Users, Package, CheckCircle,
  ArrowRight, Star, UserPlus
} from 'lucide-react';
import { DEMO_SEARCH_RESULTS, WHATSAPP_BECOME_SUPPLIER_URL, CATEGORIES } from '../data/mockData';
import { apiGetStores, ApiStore } from '../services/api';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';

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
  const { siteEmail, sitePhone, siteWhatsapp, siteInstagram, siteFacebook, siteLinkedin } = useApp();
  const { t, language } = useTranslation();
  const becomeSupplierUrl = `https://api.whatsapp.com/send?phone=${siteWhatsapp}&text=${encodeURIComponent('مرحباً، أريد إضافة متجر الجملة الخاص بي في منصة jmlamaroc.com.\n\nاسم المتجر: \nقناة التيليجرام: \nالمدينة: \nالفئة: ')}`;

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
      default: return name;
    }
  };

  const getLocalizedDemoQuery = (query: string) => {
    if (query === 'Summer Dress') return language === 'ar' ? 'فستان صيفي' : language === 'fr' ? 'Robe d\'été' : 'Summer Dress';
    if (query === 'Leather Handbag') return language === 'ar' ? 'حقيبة يد جلدية' : language === 'fr' ? 'Sac à main en cuir' : 'Leather Handbag';
    if (query === 'Wireless Earbuds') return language === 'ar' ? 'سماعات لاسلكية' : language === 'fr' ? 'Écouteurs sans fil' : 'Wireless Earbuds';
    return query;
  };

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
              style={{ backgroundColor: '#FFF2EB', color: '#E85D04', borderColor: '#E85D04' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#E85D04' }}></span>
              {t.landing.pill}
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-3 leading-tight">
              {t.landing.heroTitle}
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold mb-5 leading-tight" style={{ color: '#E8820C' }}>
              {t.landing.heroSubtitle}
            </h2>
            <p className="text-[#444444] text-lg mb-8 leading-relaxed">
              {t.landing.heroDesc}
            </p>

            {/* Search bar */}
            <div className="flex items-center gap-3 border border-[#CCCCCC] rounded-xl p-2 shadow-sm mb-4 bg-white focus-within:border-[#E85D04] transition-colors">
              <Search size={20} className="ml-2 shrink-0 text-[#888888]" />
              <input
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.landing.searchPlaceholder}
                className="flex-1 outline-none text-[#1A1A1A] placeholder:text-[#888888] bg-transparent text-sm"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="p-2 rounded-lg hover:bg-[#FFF2EB] transition-colors"
                title="Upload image"
              >
                <ImagePlus size={20} style={{ color: '#E85D04' }} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={() => navigate('/search')} />
            </div>

            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-base shadow-md transition-all hover:opacity-90"
              style={{ backgroundColor: '#E85D04' }}
            >
              <Search size={18} />
              {t.landing.searchBtn}
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
                  jmlmaroc.ma/search
                </div>
              </div>

              {/* Demo content */}
              <div className="p-5">
                {/* Header with AI label */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div style={{ backgroundColor: '#FFF2EB' }} className="px-2 py-1 rounded-full flex items-center gap-1">
                      <Zap size={12} style={{ color: '#E85D04' }} />
                      <span className="text-xs font-medium" style={{ color: '#E85D04' }}>{t.landing.aiLabel}</span>
                    </div>
                  </div>
                  <div className="text-xs text-[#888888]" style={{ backgroundColor: '#FFF2EB', padding: '2px 8px', borderRadius: '9999px', color: '#E85D04' }}>
                    0.8s
                  </div>
                </div>

                {/* Searched product */}
                <div className={`flex items-center gap-3 mb-4 p-3 rounded-xl border border-[#FFF2EB] transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}
                  style={{ backgroundColor: '#FFF2EB' }}>
                  <img src={currentDemo.img} alt="searched product" className="w-14 h-14 object-cover rounded-lg" />
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">"{getLocalizedDemoQuery(currentDemo.query)}"</p>
                    <p className="text-xs text-[#888888]">
                      {language === 'ar' 
                        ? '156 نتيجة من 28 مورد' 
                        : language === 'fr' 
                        ? '156 résultats de 28 fournisseurs' 
                        : '156 results from 28 suppliers'}
                    </p>
                  </div>
                </div>

                {/* Match cards */}
                <div className="space-y-3">
                  {DEMO_SEARCH_RESULTS.map((result, i) => (
                    <div
                      key={result.storeId}
                      className={`flex items-center gap-3 p-3 rounded-xl border border-[#CCCCCC] hover:border-[#E85D04] transition-all ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
                      style={{ transitionDelay: `${i * 50}ms` }}
                    >
                      <img src={result.imageUrl} alt={result.storeName} className="w-12 h-12 object-cover rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-sm font-semibold text-[#1A1A1A] truncate">{result.storeName}</p>
                          <span className="text-xs font-bold ml-2 shrink-0" style={{ color: result.matchScore === 100 ? '#E85D04' : '#E8820C' }}>
                            {result.matchScore}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-[#888888]">
                            {result.similarProducts} {language === 'ar' ? 'منتج مشابه' : language === 'fr' ? 'produits similaires' : 'similar products'}
                          </p>
                          <p className="text-sm font-bold" style={{ color: '#E85D04' }}>{result.price} MAD</p>
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
      <section className="border-y border-[#CCCCCC]" style={{ backgroundColor: '#FFF2EB' }}>
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { 
              icon: Package, 
              value: '1M+', 
              label: language === 'ar' ? 'المنتجات المؤرشفة' : language === 'fr' ? 'Produits répertoriés' : 'Products Indexed' 
            },
            { 
              icon: Users, 
              value: totalStores > 0 ? `${totalStores}+` : '100+', 
              label: language === 'ar' ? 'متاجر الجملة' : language === 'fr' ? 'Boutiques de gros' : 'Wholesale Stores' 
            },
            { 
              icon: Zap, 
              value: '<1s', 
              label: language === 'ar' ? 'سرعة البحث' : language === 'fr' ? 'Vitesse de recherche' : 'Search Speed' 
            },
            { 
              icon: Shield, 
              value: 'SSL', 
              label: language === 'ar' ? 'حساب آمن ومُشفر' : language === 'fr' ? 'Compte sécurisé, chiffré' : 'Account is Safe, Encrypted' 
            },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: '#E85D04' }}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: '#E85D04' }}>{value}</p>
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
            <h2 className="text-2xl font-bold text-[#1A1A1A]">{t.nav.categories}</h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-3">
            {LANDING_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate(`/search?category=${encodeURIComponent(cat.name)}`)}
                className="flex flex-col items-center justify-center gap-2.5 p-4 bg-white rounded-2xl border border-[#E8E8E8] hover:border-[#E85D04] hover:shadow-md transition-all group"
                style={{ minHeight: '100px' }}
              >
                <div style={{ color: '#E85D04' }} className="group-hover:scale-110 transition-transform duration-200">
                  {CATEGORY_ICONS[cat.name] ?? CATEGORY_ICONS['default']}
                </div>
                <span className="text-xs font-medium text-center leading-tight" style={{ color: '#1A5C48' }}>
                  {getLocalizedCategoryName(cat.name)}
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
            style={{ backgroundColor: '#E85D04' }}
          >
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-white mb-1.5">{language === 'ar' ? 'سجل مجاناً كتاجر تجزئة!' : language === 'fr' ? 'Inscrivez-vous gratuitement en tant que détaillant !' : 'Sign up free as a retailer!'}</h3>
              <p className="text-sm" style={{ color: '#B2D8CC' }}>
                {language === 'ar' 
                  ? 'البحث البصري، التواصل المباشر مع المصانع، وحفظ المفضلة لبناء شبكة التوريد الخاصة بك بدون وسطاء.' 
                  : language === 'fr' 
                  ? 'Recherche visuelle, contact direct avec les usines et enregistrement des favoris pour construire votre propre réseau d\'approvisionnement.' 
                  : 'Search visually, connect directly with factories, and save favorites to build your own supply network without middlemen.'}
              </p>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="shrink-0 px-6 py-3 bg-white rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm"
              style={{ color: '#1A1A1A' }}
            >
              {language === 'ar' ? 'إنشاء حساب مجاني' : language === 'fr' ? 'Créer un compte gratuit' : 'Create free account'}
            </button>
          </div>
        </div>
      </section>

      {/* Featured Stores Section */}
      <section className="py-14 px-4" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">{t.landing.featuredStores}</h2>
              <p className="text-[#888888]">{t.landing.featuredStoresDesc}</p>
            </div>
            <button onClick={() => navigate('/groups')} className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: '#E85D04' }}>
              {language === 'ar' ? 'عرض جميع المتاجر' : language === 'fr' ? 'Voir toutes les boutiques' : 'View all stores'} <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {stores.map(store => (
              <button
                key={store._id}
                onClick={() => navigate(`/groups/${store.handle}`)}
                className="bg-white rounded-xl overflow-hidden border border-[#CCCCCC] hover:shadow-lg hover:border-[#E85D04] transition-all text-left group"
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
                  <div style={{ backgroundColor: '#E85D04' }} className="absolute bottom-2 left-2 w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow overflow-hidden">
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
                  <p className="text-xs mt-1 font-bold" style={{ color: '#E85D04' }}>{store.productCount.toLocaleString()} {t.nav.search.toLowerCase() === 'recherche' ? 'produits' : language === 'ar' ? 'منتج' : 'products'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
            {language === 'ar' ? 'كيف تعمل منصة JML Maroc' : language === 'fr' ? 'Comment fonctionne JML Maroc' : 'How JML Maroc Works'}
          </h2>
          <p className="text-[#888888] mb-12">
            {language === 'ar' ? 'ثلاث خطوات بسيطة للعثور على مورد الجملة الخاص بك' : language === 'fr' ? 'Trois étapes simples pour trouver votre grossiste' : 'Three simple steps to find your wholesale supplier'}
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: ImagePlus, title: language === 'ar' ? 'رفع صورة المنتج' : language === 'fr' ? 'Télécharger l\'image d\'un produit' : 'Upload a Product Image', desc: language === 'ar' ? 'التقط صورة أو ارفع أي صورة منتج تريد الحصول عليه.' : language === 'fr' ? 'Prenez une photo ou téléchargez une image du produit.' : 'Take a photo or upload any product image you want to source.' },
              { step: '2', icon: Search, title: language === 'ar' ? 'الذكاء الاصطناعي يبحث' : language === 'fr' ? 'L\'IA trouve tous les grossistes' : 'AI Finds All Suppliers', desc: language === 'ar' ? 'يقوم نظامنا بالبحث في أكثر من مليون منتج للعثور على الموردين.' : language === 'fr' ? 'Notre IA recherche parmi 1M+ produits pour trouver chaque grossiste.' : 'Our AI searches 1M+ products to find every wholesaler selling it.' },
              { step: '3', icon: CheckCircle, title: language === 'ar' ? 'تواصل واطلب' : language === 'fr' ? 'Se connecter & commander' : 'Connect & Order', desc: language === 'ar' ? 'قارن الأسعار، ثم تواصل مع الموردين مباشرة عبر واتساب أو تيليجرام.' : language === 'fr' ? 'Comparez les prix, puis contactez les fournisseurs via WhatsApp ou Telegram.' : 'Compare prices, then contact suppliers directly via WhatsApp or Telegram.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-md" style={{ backgroundColor: '#E85D04' }}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className="text-xs font-bold px-3 py-1 rounded-full mb-3" style={{ backgroundColor: '#FFF2EB', color: '#E85D04' }}>{language === 'ar' ? `الخطوة ${step}` : language === 'fr' ? `Étape ${step}` : `Step ${step}`}</div>
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
            style={{ backgroundColor: '#3E1A0A' }}
          >
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ backgroundColor: '#E8820C', color: 'white' }}>
                <Star size={12} /> {language === 'ar' ? 'لموردي الجملة' : language === 'fr' ? 'Pour les grossistes' : 'For Wholesale Suppliers'}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{t.landing.becomeSupplierTitle}</h2>
              <p className="text-sm opacity-70" style={{ color: '#FFF2EB' }}>
                {t.landing.becomeSupplierDesc}
              </p>
              <div className="flex gap-5 mt-4 text-sm text-white opacity-60">
                <span>✓ {t.landing.freeListing}</span>
                <span>✓ {t.landing.directWhatsapp}</span>
                <span>✓ {t.landing.supplierCount}</span>
              </div>
            </div>
            <a
              href={becomeSupplierUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity shadow-md"
              style={{ backgroundColor: '#E8820C' }}
            >
              <Star size={18} /> {t.landing.becomeSupplierBtn}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#111111' }} className="text-white pt-16 pb-0 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Top 4-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#2A2A2A]">

            {/* Column 1 — Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/images/Logo.png" alt="JML Maroc" className="w-12 h-12 rounded-xl object-contain" />
                <div>
                  <p className="font-bold text-lg leading-tight">JML Maroc</p>
                  <p className="text-xs text-[#888888]">jmlamaroc.com</p>
                </div>
              </div>
              <p className="text-sm text-[#888888] leading-relaxed mb-6">
                {language === 'ar' 
                  ? 'أكبر دليل B2B وأسواق الجملة في المغرب. ابحث عن أي مورد يبيع المنتجات التي تريدها فوراً بالأسعار المباشرة.' 
                  : language === 'fr' 
                  ? 'Le plus grand annuaire B2B et marché de gros au Maroc. Trouvez instantanément chaque grossiste vendant le produit dont vous avez besoin.' 
                  : 'Morocco\'s largest B2B wholesale marketplace. Find every supplier selling the product you need — instantly, with direct prices.'}
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-3">
                <a href={siteInstagram} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                  style={{ backgroundColor: '#2A2A2A' }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href={siteFacebook} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                  style={{ backgroundColor: '#2A2A2A' }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href={siteLinkedin} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                  style={{ backgroundColor: '#2A2A2A' }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href={`https://wa.me/${siteWhatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                  style={{ backgroundColor: '#25D366' }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              </div>
            </div>

            {/* Column 2 — Quick Links */}
            <div>
              <h3 className="font-bold text-base mb-5 text-white">
                {language === 'ar' ? 'روابط سريعة' : language === 'fr' ? 'Liens rapides' : 'Quick Links'}
              </h3>
              <ul className="space-y-3">
                {[
                  { label: language === 'ar' ? 'الرئيسية' : language === 'fr' ? 'Accueil' : 'Home', to: '/' },
                  { label: language === 'ar' ? 'البحث عن المنتجات' : language === 'fr' ? 'Rechercher des produits' : 'Search Products', to: '/search' },
                  { label: language === 'ar' ? 'تصفح المتاجر' : language === 'fr' ? 'Parcourir les boutiques' : 'Browse Stores', to: '/groups' },
                  { label: language === 'ar' ? 'كن مورداً' : language === 'fr' ? 'Devenir fournisseur' : 'Become a Supplier', to: '/apply-supplier' },
                ].map(({ label, to }) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-[#888888] hover:text-[#E85D04] transition-colors flex items-center gap-2">
                      <span style={{ color: '#E85D04' }}>›</span> {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Categories */}
            <div>
              <h3 className="font-bold text-base mb-5 text-white">{t.nav.categories}</h3>
              <ul className="space-y-3">
                {[
                  "Women's Clothing", "Men's Clothing", "Shoes", "Bags",
                  "Jewelry", "Skincare", "Perfume", "Kitchen Tools",
                ].map(cat => (
                  <li key={cat}>
                    <Link to={`/search?category=${encodeURIComponent(cat)}`} className="text-sm text-[#888888] hover:text-[#E85D04] transition-colors flex items-center gap-2">
                      <span style={{ color: '#E85D04' }}>›</span> {getLocalizedCategoryName(cat)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 — Contact */}
            <div>
              <h3 className="font-bold text-base mb-5 text-white">
                {language === 'ar' ? 'اتصل بنا' : language === 'fr' ? 'Contactez-nous' : 'Contact Us'}
              </h3>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: '#2A2A2A' }}>
                    <svg width="14" height="14" fill="none" stroke="#E85D04" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.17 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.1a16 16 0 006 6l.46-.46a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                  </div>
                  <div>
                    <p className="text-xs text-[#888888] mb-0.5">
                      {language === 'ar' ? 'الهاتف / واتساب' : language === 'fr' ? 'Téléphone / WhatsApp' : 'Phone / WhatsApp'}
                    </p>
                    <a href={`tel:${sitePhone.replace(/\s/g, '')}`} className="text-sm text-white hover:text-[#E85D04] transition-colors font-medium">{sitePhone}</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: '#2A2A2A' }}>
                    <svg width="14" height="14" fill="none" stroke="#E85D04" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <div>
                    <p className="text-xs text-[#888888] mb-0.5">
                      {language === 'ar' ? 'البريد الإلكتروني' : language === 'fr' ? 'E-mail' : 'Email'}
                    </p>
                    <a href={`mailto:${siteEmail}`} className="text-sm text-white hover:text-[#E85D04] transition-colors font-medium">{siteEmail}</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: '#2A2A2A' }}>
                    <svg width="14" height="14" fill="none" stroke="#E85D04" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div>
                    <p className="text-xs text-[#888888] mb-0.5">
                      {language === 'ar' ? 'الموقع' : language === 'fr' ? 'Localisation' : 'Location'}
                    </p>
                    <p className="text-sm text-white font-medium">
                      {language === 'ar' ? 'الدار البيضاء، المغرب 🇲🇦' : language === 'fr' ? 'Casablanca, Maroc 🇲🇦' : 'Casablanca, Morocco 🇲🇦'}
                    </p>
                  </div>
                </li>
              </ul>
              {/* WhatsApp CTA */}
              <a
                href={`https://wa.me/${siteWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#25D366' }}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                {language === 'ar' ? 'تحدث معنا على واتساب' : language === 'fr' ? 'Discuter sur WhatsApp' : 'Chat on WhatsApp'}
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#888888]">
            <div className="flex items-center gap-3">
              <img src="/images/Logo.png" alt="JML Maroc" className="w-7 h-7 rounded-lg object-contain" />
              <span>
                © 2026 <span className="text-white font-medium">JML Maroc</span>. {language === 'ar' ? 'جميع الحقوق محفوظة.' : language === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}
              </span>
            </div>
            <p className="text-xs">
              {language === 'ar' ? 'أكبر سوق جملة في المغرب 🇲🇦' : language === 'fr' ? 'Le plus grand marché de gros du Maroc 🇲🇦' : "Morocco's largest wholesale marketplace 🇲🇦"}
            </p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-white transition-colors">
                {language === 'ar' ? 'سياسة الخصوصية' : language === 'fr' ? 'Confidentialité' : 'Privacy'}
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                {language === 'ar' ? 'الشروط والأحكام' : language === 'fr' ? 'Conditions' : 'Terms'}
              </Link>
              <a href={`https://wa.me/${siteWhatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#E85D04] transition-colors">
                {language === 'ar' ? 'اتصل بنا' : language === 'fr' ? 'Contact' : 'Contact'}
              </a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
