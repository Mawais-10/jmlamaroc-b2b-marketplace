import { Link, useNavigate } from 'react-router';
import { Phone, Instagram, Facebook, Linkedin, MessageCircle, ShieldCheck, Search, LayoutGrid, Radio, ShoppingCart, Heart, User, ChevronDown, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WHATSAPP_BECOME_SUPPLIER_URL } from '../../data/mockData';

export function PublicHeader() {
  const { user } = useApp();
  const navigate = useNavigate();

  const handleFavorites = () => {
    if (!user) navigate('/login?redirect=/favorites');
    else navigate('/favorites');
  };

  const handleAccount = () => {
    if (!user) navigate('/login');
    else navigate('/settings');
  };

  return (
    <header className="w-full">
      {/* Top bar - dark green */}
      <div style={{ backgroundColor: '#1E3A30' }} className="px-4 py-2 flex items-center justify-between text-white text-sm">
        <div className="flex items-center gap-4">
          <a href="tel:+923180505202" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <Phone size={14} />
            <span>+923180505202</span>
          </a>
          <div className="flex items-center gap-2">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <Instagram size={15} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <Facebook size={15} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <Linkedin size={15} />
            </a>
            <a href="https://wa.me/923180505202" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <MessageCircle size={15} />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/about" className="hover:opacity-80 transition-opacity">About</Link>
          <Link to="/support" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
            <ShieldCheck size={14} />
            <span>Help & Support</span>
          </Link>
        </div>
      </div>

      {/* Main nav bar - white */}
      <div className="bg-white border-b border-[#CCCCCC] px-6 py-3 flex items-center justify-between shadow-sm">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div style={{ backgroundColor: '#1A7A5E' }} className="w-8 h-8 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span style={{ color: '#1A7A5E' }} className="text-xl font-bold tracking-tight">ChouFliya</span>
        </Link>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/search" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[#444444] hover:bg-[#E8F5F0] hover:text-[#1A7A5E] transition-colors text-sm font-medium">
            <Search size={16} />
            <span>Search</span>
          </Link>
          <Link to="/groups" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[#444444] hover:bg-[#E8F5F0] hover:text-[#1A7A5E] transition-colors text-sm font-medium">
            <LayoutGrid size={16} />
            <span>Stores</span>
          </Link>
          <Link to="/trending" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[#444444] hover:bg-[#E8F5F0] hover:text-[#1A7A5E] transition-colors text-sm font-medium">
            <Radio size={16} />
            <span>Trending</span>
          </Link>
          <a
            href={WHATSAPP_BECOME_SUPPLIER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-medium transition-opacity hover:opacity-90 ml-2"
            style={{ backgroundColor: '#E8820C' }}
          >
            <ShoppingCart size={15} />
            <span>Become a Supplier</span>
          </a>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* <button className="flex items-center gap-1 text-sm text-[#444444] hover:text-[#1A7A5E] transition-colors px-2 py-1 rounded">
            <Globe size={15} />
            <span className="hidden sm:inline">GB EN</span>
            <ChevronDown size={13} />
          </button> */}
          <button onClick={handleFavorites} className="p-2 rounded-lg hover:bg-[#E8F5F0] text-[#444444] hover:text-[#1A7A5E] transition-colors">
            <Heart size={20} />
          </button>
          <button onClick={handleAccount} className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-[#E8F5F0] text-[#444444] hover:text-[#1A7A5E] transition-colors text-sm font-medium">
            <User size={18} />
            <span className="hidden sm:inline">Account</span>
          </button>
        </div>
      </div>
    </header>
  );
}
