import { Link, useLocation, useNavigate, Outlet } from 'react-router';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Store, Package, ClipboardList,
  LogOut, Menu, X, Shield, ChevronRight, Headphones
} from 'lucide-react';
import { toast } from 'sonner';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { label: 'Support Tickets', icon: Headphones, to: '/admin/support' },
  { label: 'Supplier Requests', icon: ClipboardList, to: '/admin/requests' },
  { label: 'Manage Stores', icon: Store, to: '/admin/stores' },
  { label: 'Manage Users', icon: Users, to: '/admin/users' },
  { label: 'Manage Products', icon: Package, to: '/admin/products' },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const adminToken = localStorage.getItem('choufliya_admin_token') || localStorage.getItem('choufliya_token');

  useEffect(() => {
    if (!adminToken) navigate('/admin/login');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('choufliya_admin_token');
    toast.success('Logged out from admin panel');
    navigate('/admin/login');
  };

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0F1F1A' }}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}
        style={{ backgroundColor: '#1E3A30' }}>
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div style={{ backgroundColor: '#1A7A5E' }} className="w-8 h-8 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">ChouFliya</p>
              <p className="text-xs" style={{ color: '#E8820C' }}>ADMIN PANEL</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(item.to) ? 'text-white font-semibold' : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              style={isActive(item.to) ? { backgroundColor: '#1A7A5E' } : {}}
            >
              <item.icon size={17} className="shrink-0" />
              <span>{item.label}</span>
              {isActive(item.to) && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-14 border-b border-white/5 flex items-center px-6 gap-4 shrink-0" style={{ backgroundColor: '#1E3A30' }}>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-white/60 hover:text-white">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            {/* <span className="w-2 h-2 rounded-full bg-green-400" /> */}
            <span className="text-xs text-white/60"></span>
          </div>
          <div className="ml-auto text-xs text-white/40"></div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto" style={{ backgroundColor: '#F5F5F5' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
