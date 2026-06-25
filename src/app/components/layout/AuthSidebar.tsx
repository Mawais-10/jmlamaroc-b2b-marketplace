import { Link, useLocation, useNavigate } from 'react-router';
import {
  Search, LayoutGrid, Radio, Layers, Heart, Settings, Headphones,
  Plus, ChevronsLeft, ChevronsRight, Bell, ChevronDown, Globe, LogOut,
  Store, Package, Shield, CheckCircle2, AlertCircle, Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation';

const buyerMenuItems = [
  { label: 'Search', icon: Search, to: '/search' },
  { label: 'Stores', icon: LayoutGrid, to: '/groups' },
  { label: 'Trend Radar', icon: Radio, to: '/trending' },
  { label: 'Collections', icon: Layers, to: '/collections' },
  { label: 'Favorites', icon: Heart, to: '/favorites' },
];

const supplierMenuItems = [
  { label: 'Search', icon: Search, to: '/search' },
  { label: 'Stores', icon: LayoutGrid, to: '/groups' },
  { label: 'My Store', icon: Store, to: '/store/dashboard' },
  { label: 'Collections', icon: Layers, to: '/collections' },
  { label: 'Favorites', icon: Heart, to: '/favorites' },
];

const adminMenuItems = [
  { label: 'Search', icon: Search, to: '/search' },
  { label: 'Stores', icon: LayoutGrid, to: '/groups' },
];

const accountItems = [
  { label: 'Settings', icon: Settings, to: '/settings' },
  { label: 'Support', icon: Headphones, to: '/support' },
];

export function AuthSidebar() {
  const { user, sidebarCollapsed, toggleSidebar, logout } = useApp();
  const { language } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
  const isSupplier = user?.role === 'supplier';
  const isAdmin = user?.role === 'admin';
  const menuItems = isAdmin ? adminMenuItems : (isSupplier ? supplierMenuItems : buyerMenuItems);

  const getLocalizedLabel = (label: string) => {
    switch (label) {
      case 'Search': return language === 'ar' ? 'بحث' : language === 'fr' ? 'Rechercher' : 'Search';
      case 'Stores': return language === 'ar' ? 'المتاجر' : language === 'fr' ? 'Boutiques' : 'Stores';
      case 'Trend Radar': return language === 'ar' ? 'رادار الصيحات' : language === 'fr' ? 'Radar des tendances' : 'Trend Radar';
      case 'Collections': return language === 'ar' ? 'المجموعات' : language === 'fr' ? 'Collections' : 'Collections';
      case 'Favorites': return language === 'ar' ? 'المفضلة' : language === 'fr' ? 'Favoris' : 'Favorites';
      case 'My Store': return language === 'ar' ? 'متجري' : language === 'fr' ? 'Mon magasin' : 'My Store';
      case 'Settings': return language === 'ar' ? 'الإعدادات' : language === 'fr' ? 'Paramètres' : 'Settings';
      case 'Support': return language === 'ar' ? 'الدعم الفني' : language === 'fr' ? 'Support' : 'Support';
      default: return label;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = () => {
    if (isAdmin) return { label: language === 'ar' ? 'مدير' : language === 'fr' ? 'Admin' : 'Admin', color: '#CC0000', bg: '#FEF2F2' };
    if (isSupplier) return { label: language === 'ar' ? 'مورد' : language === 'fr' ? 'Fournisseur' : 'Supplier', color: '#E8820C', bg: '#FFF8E1' };
    return null;
  };

  const roleBadge = getRoleBadge();

  return (
    <div
      className="flex flex-col h-screen sticky top-0 transition-all duration-300 border-r border-[#CCCCCC] shrink-0"
      style={{ backgroundColor: '#fff', width: sidebarCollapsed ? '70px' : '240px' }}
    >
      <div className="flex items-center gap-2 px-4 py-4 border-b border-[#CCCCCC]">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <img src="/images/Logo.png" alt="Logo" className="w-12 h-12 rounded-lg object-contain shrink-0" />
        </Link>
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto py-4 px-2">
        {/* MENU section */}
        {!sidebarCollapsed && (
          <p className="text-xs font-semibold text-[#888888] uppercase tracking-wider px-3 mb-2">
            {language === 'ar' ? 'القائمة' : language === 'fr' ? 'Menu' : 'Menu'}
          </p>
        )}
        <nav className="space-y-0.5 mb-6">
          {menuItems.map(({ label, icon: Icon, to }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive(to) ? 'text-white' : 'text-[#444444] hover:bg-[#FFF2EB] hover:text-[#E85D04]'}`}
              style={isActive(to) ? { backgroundColor: '#E85D04' } : {}}
              title={sidebarCollapsed ? getLocalizedLabel(label) : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-medium">{getLocalizedLabel(label)}</span>}
            </Link>
          ))}
        </nav>

        {/* ACCOUNT section */}
        {!sidebarCollapsed && (
          <p className="text-xs font-semibold text-[#888888] uppercase tracking-wider px-3 mb-2">
            {language === 'ar' ? 'الحساب' : language === 'fr' ? 'Compte' : 'Account'}
          </p>
        )}
        <nav className="space-y-0.5">
          {accountItems.map(({ label, icon: Icon, to }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive(to) ? 'text-white' : 'text-[#444444] hover:bg-[#FFF2EB] hover:text-[#E85D04]'}`}
              style={isActive(to) ? { backgroundColor: '#E85D04' } : {}}
              title={sidebarCollapsed ? getLocalizedLabel(label) : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-medium">{getLocalizedLabel(label)}</span>}
            </Link>
          ))}

          {/* Admin Panel link for admins */}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#444444] hover:bg-red-50 hover:text-red-600 transition-colors"
              title={sidebarCollapsed ? (language === 'ar' ? 'لوحة التحكم' : language === 'fr' ? 'Panneau Admin' : 'Admin Panel') : undefined}
            >
              <Shield size={18} className="shrink-0 text-red-500" />
              {!sidebarCollapsed && <span className="text-sm font-medium">{language === 'ar' ? 'لوحة التحكم' : language === 'fr' ? 'Panneau Admin' : 'Admin Panel'}</span>}
            </Link>
          )}

          {/* Become supplier / Apply for buyer */}
          {!isSupplier && !isAdmin && (
            <Link
              to="/apply-supplier"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#444444] hover:bg-[#FFF2EB] hover:text-[#E85D04] transition-colors"
              title={sidebarCollapsed ? (language === 'ar' ? 'كن مورداً' : language === 'fr' ? 'Devenir fournisseur' : 'Become a Supplier') : undefined}
            >
              <Plus size={18} className="shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-medium">{language === 'ar' ? 'كن مورداً' : language === 'fr' ? 'Devenir fournisseur' : 'Become a Supplier'}</span>}
            </Link>
          )}

          <button
            onClick={toggleSidebar}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#444444] hover:bg-[#FFF2EB] hover:text-[#E85D04] transition-colors"
            title={sidebarCollapsed ? (language === 'ar' ? 'توسيع الشريط الجانبي' : language === 'fr' ? 'Agrandir la barre' : 'Expand sidebar') : (language === 'ar' ? 'تصغير الشريط الجانبي' : language === 'fr' ? 'Réduire la barre' : 'Collapse sidebar')}
          >
            {sidebarCollapsed ? (
              <ChevronsRight size={18} className="shrink-0" />
            ) : (
              <>
                <ChevronsLeft size={18} className="shrink-0" />
                <span className="text-sm font-medium">
                  {language === 'ar' ? 'تصغير' : language === 'fr' ? 'Réduire' : 'Collapse'}
                </span>
              </>
            )}
          </button>
        </nav>
      </div>

      {/* User profile at bottom */}
      <div className="border-t border-[#CCCCCC] p-3">
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-[#FFF2EB] transition-colors"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
              <div
                style={{ backgroundColor: '#E85D04' }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            {!sidebarCollapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{user?.name || 'User'}</p>
                    {roleBadge && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0"
                        style={{ backgroundColor: roleBadge.bg, color: roleBadge.color }}>
                        {roleBadge.label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#888888] truncate">{user?.email}</p>
                </div>
                <ChevronDown size={14} className="text-[#888888] shrink-0" />
              </>
            )}
          </button>
          {userMenuOpen && !sidebarCollapsed && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-[#CCCCCC] rounded-lg shadow-lg overflow-hidden z-50">
              <Link to="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#444444] hover:bg-[#F5F5F5] transition-colors">
                <Settings size={15} /> {language === 'ar' ? 'الإعدادات' : language === 'fr' ? 'Paramètres' : 'Settings'}
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                <span>{language === 'ar' ? 'تسجيل الخروج' : language === 'fr' ? 'Déconnexion' : 'Sign Out'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AuthTopBar() {
  const {
    user, logout, notifications, unreadNotifications,
    markNotificationRead, markAllNotificationsRead
  } = useApp();
  const { language } = useTranslation();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleNotifClick = (n: any) => {
    markNotificationRead(n._id);
    if (n.link) navigate(n.link);
    setNotifOpen(false);
  };

  return (
    <div className="h-14 bg-white border-b border-[#CCCCCC] flex items-center justify-end px-6 gap-3 shrink-0 relative">
      {/* <button className="flex items-center gap-1 text-sm text-[#444444] hover:text-[#E85D04] transition-colors px-2 py-1 rounded">
        <Globe size={15} />
        <span>EN</span>
        <ChevronDown size={13} />
      </button> */}

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="p-2 rounded-lg hover:bg-[#FFF2EB] text-[#444444] hover:text-[#E85D04] transition-colors relative"
        >
          <Bell size={18} />
          {unreadNotifications > 0 && (
            <span
              className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
              style={{ backgroundColor: '#EF4444' }}
            >
              {unreadNotifications}
            </span>
          )}
        </button>

        {notifOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
            <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#F1F5F9] flex items-center justify-between bg-gray-50/50">
                <h3 className="text-sm font-bold text-[#1E293B]">
                  {language === 'ar' ? 'الإشعارات' : language === 'fr' ? 'Notifications' : 'Notifications'}
                </h3>
                {unreadNotifications > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs font-medium text-[#E85D04] hover:underline"
                  >
                    {language === 'ar' ? 'تحديد الكل كمقروء' : language === 'fr' ? 'Tout marquer comme lu' : 'Mark all read'}
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell size={32} className="mx-auto mb-2 text-[#CBD5E1]" />
                    <p className="text-sm text-[#64748B]">
                      {language === 'ar' ? 'لا توجد إشعارات بعد' : language === 'fr' ? 'Aucune notification pour le moment' : 'No notifications yet'}
                    </p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <button
                      key={n._id}
                      onClick={() => handleNotifClick(n)}
                      className={`w-full text-left px-4 py-3 border-b border-[#F1F5F9] hover:bg-gray-50 transition-colors flex gap-3 ${!n.isRead ? 'bg-[#FFF2EB]/20' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.type === 'success' ? 'bg-green-100 text-green-600' :
                          n.type === 'error' ? 'bg-red-100 text-red-600' :
                            n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                        {n.type === 'success' ? <CheckCircle2 size={16} /> :
                          n.type === 'error' ? <AlertCircle size={16} /> :
                            n.type === 'warning' ? <AlertCircle size={16} /> : <Zap size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${!n.isRead ? 'text-[#1E293B]' : 'text-[#64748B]'}`}>{n.title}</p>
                        <p className="text-xs text-[#64748B] line-clamp-2 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-[#94A3B8] mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                      </div>
                      {!n.isRead && (
                        <div className="w-2 h-2 rounded-full bg-[#E85D04] mt-2 shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <button
        onClick={() => navigate('/settings')}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#FFF2EB] transition-colors"
      >
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div style={{ backgroundColor: '#E85D04' }} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
        <span className="text-sm font-medium text-[#444444] hidden sm:inline">{user?.name?.split(' ')[0]}</span>
        <ChevronDown size={13} className="text-[#888888]" />
      </button>
    </div>
  );
}
