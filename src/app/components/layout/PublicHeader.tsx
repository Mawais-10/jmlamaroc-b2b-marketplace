import { Link, useNavigate } from 'react-router';
import { Phone, Instagram, Facebook, Linkedin, MessageCircle, ShieldCheck, Search, LayoutGrid, Radio, ShoppingCart, Heart, User, ChevronDown, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WHATSAPP_BECOME_SUPPLIER_URL } from '../../data/mockData';
import { useTranslation, LanguageType } from '../../i18n/useTranslation';
import { useState, useRef, useEffect } from 'react';

const CATEGORY_GROUPS = [
  {
    title: "الملابس والأحذية (Apparel & Shoes)",
    items: [
      { name: "Women's Clothing", label: "ملابس نسائية", q: "Women's Clothing" },
      { name: "Men's Clothing", label: "ملابس رجالية", q: "Men's Clothing" },
      { name: "Kids' Clothing", label: "ملابس أطفال", q: "Kids' Clothing" },
      { name: "Traditional wear", label: "ملابس تقليدية", q: "Traditional clothing" },
      { name: "Shoes", label: "الأحذية", q: "Shoes" }
    ]
  },
  {
    title: "موضة وإكسسوارات (Bags & Accessories)",
    items: [
      { name: "Bags & Purses", label: "حقائب يد", q: "Bags" },
      { name: "Travel luggage", label: "حقائب سفر", q: "Travel" },
      { name: "Watches", label: "ساعات", q: "Watches" },
      { name: "Jewelry", label: "مجوهرات وإكسسوارات", q: "Jewelry" }
    ]
  },
  {
    title: "العناية والتجميل (Beauty & Care)",
    items: [
      { name: "Perfume", label: "العطور وبخور", q: "Perfume" },
      { name: "Skincare", label: "العناية بالبشرة", q: "Skincare" },
      { name: "Haircare", label: "العناية بالشعر", q: "Haircare" },
      { name: "Makeup", label: "مكياج وتجميل", q: "Makeup" }
    ]
  },
  {
    title: "المنزل والتقنية (Home, Tech & Auto)",
    items: [
      { name: "Kitchen Tools", label: "أدوات المطبخ", q: "Kitchen Tools" },
      { name: "Home Decor", label: "ديكور منزلي", q: "Decor" },
      { name: "Smart electronics", label: "إلكترونيات ذكية", q: "Electronics" },
      { name: "Car accessories", label: "مستلزمات السيارات", q: "Automotive" }
    ]
  }
];

export function PublicHeader() {
  const { user, sitePhone, siteWhatsapp, siteInstagram, siteFacebook, siteLinkedin } = useApp();
  const { t, language, setLanguage } = useTranslation();
  const navigate = useNavigate();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFavorites = () => {
    if (!user) navigate('/login?redirect=/favorites');
    else navigate('/favorites');
  };

  const handleAccount = () => {
    if (!user) navigate('/login');
    else navigate('/settings');
  };

  const languages = [
    { code: 'en', label: 'English', flag: 'GB' },
    { code: 'ar', label: 'العربية', flag: 'MA' },
    { code: 'fr', label: 'Français', flag: 'FR' }
  ];

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  return (
    <header className="w-full">
      {/* Top bar - dark green */}
      <div style={{ backgroundColor: '#3E1A0A' }} className="px-4 py-2 flex items-center justify-between text-white text-sm">
        <div className="flex items-center gap-4">
          <a href={`tel:${sitePhone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <Phone size={14} />
            <span>{sitePhone}</span>
          </a>
          <div className="flex items-center gap-2">
            <a href={siteInstagram} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <Instagram size={15} />
            </a>
            <a href={siteFacebook} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <Facebook size={15} />
            </a>
            <a href={siteLinkedin} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <Linkedin size={15} />
            </a>
            <a href={`https://wa.me/${siteWhatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <MessageCircle size={15} />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/about" className="hover:opacity-80 transition-opacity">{t.nav.about}</Link>
          <Link to="/support" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
            <ShieldCheck size={14} />
            <span>{t.nav.support}</span>
          </Link>
        </div>
      </div>

      {/* Main nav bar - white */}
      <div className="bg-white border-b border-[#CCCCCC] px-6 py-3 flex items-center justify-between shadow-sm">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/images/Logo.png" alt="JML Maroc" className="h-10 object-contain rounded-lg" />
        </Link>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Categories Hover Menu */}
          <div className="relative group py-2">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[#444444] hover:bg-[#FFF2EB] hover:text-[#E85D04] transition-colors text-sm font-semibold cursor-pointer">
              <LayoutGrid size={16} />
              <span>{t.nav.categories}</span>
              <ChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180" />
            </button>

            {/* Mega Menu Dropdown */}
            <div className="absolute top-full left-0 mt-1 w-[760px] bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-6 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50 grid grid-cols-4 gap-6">
              {CATEGORY_GROUPS.map((group) => (
                <div key={group.title} className="space-y-3">
                  <h4 className="font-bold text-xs text-[#E85D04] pb-1.5 border-b border-gray-100 uppercase tracking-wide">
                    {group.title}
                  </h4>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={`/search?q=${encodeURIComponent(item.q)}&category=${encodeURIComponent(item.name)}`}
                          className="block p-1.5 rounded-lg hover:bg-[#FFF2EB] hover:translate-x-1 transition-all duration-150"
                        >
                          <span className="text-xs font-semibold text-gray-800 hover:text-[#E85D04] block">{item.label}</span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <Link to="/search" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[#444444] hover:bg-[#FFF2EB] hover:text-[#E85D04] transition-colors text-sm font-medium">
            <Search size={16} />
            <span>{t.nav.search}</span>
          </Link>
          <Link to="/groups" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[#444444] hover:bg-[#FFF2EB] hover:text-[#E85D04] transition-colors text-sm font-medium">
            <LayoutGrid size={16} />
            <span>{t.nav.stores}</span>
          </Link>
          <Link to="/trending" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[#444444] hover:bg-[#FFF2EB] hover:text-[#E85D04] transition-colors text-sm font-medium">
            <Radio size={16} />
            <span>{t.nav.trending}</span>
          </Link>
          <a
            href={WHATSAPP_BECOME_SUPPLIER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-medium transition-opacity hover:opacity-90 ml-2"
            style={{ backgroundColor: '#E8820C' }}
          >
            <ShoppingCart size={15} />
            <span>{t.nav.becomeSupplier}</span>
          </a>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Language Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 text-sm text-[#444444] hover:bg-[#FFF2EB] hover:text-[#E85D04] transition-colors px-3 py-2 rounded-lg border border-[#E2E8F0] font-semibold"
            >
              <Globe size={15} />
              <span>{currentLangObj.flag} {currentLangObj.code.toUpperCase()}</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-40 bg-white border border-[#E2E8F0] rounded-xl shadow-lg py-1.5 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-xs font-semibold hover:bg-[#FFF2EB] hover:text-[#E85D04] transition-colors ${
                      language === lang.code ? 'text-[#E85D04] bg-[#FFF2EB]' : 'text-gray-700'
                    }`}
                  >
                    <span>{lang.flag} {lang.label}</span>
                    {language === lang.code && (
                      <span className="text-[#E85D04] text-[10px]">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleFavorites} className="p-2 rounded-lg hover:bg-[#FFF2EB] text-[#444444] hover:text-[#E85D04] transition-colors">
            <Heart size={20} />
          </button>
          <button onClick={handleAccount} className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-[#FFF2EB] text-[#444444] hover:text-[#E85D04] transition-colors text-sm font-medium">
            <User size={18} />
            <span className="hidden sm:inline">{t.nav.account}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
