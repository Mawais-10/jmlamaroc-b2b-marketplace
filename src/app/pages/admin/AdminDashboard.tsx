import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Users, Store, ClipboardList, ArrowRight, TrendingUp, AlertCircle, RefreshCw, Save, Mail, Phone, Globe } from 'lucide-react';
import { apiAdminStats, apiAdminGetRequests, AdminStats, ApiSupplierRequest, apiAdminGetSettings, apiAdminUpdateSettings } from '../../services/api';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingRequests, setPendingRequests] = useState<ApiSupplierRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Contact and Social settings state
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [linkedinLink, setLinkedinLink] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    Promise.all([
      apiAdminStats(),
      apiAdminGetRequests('pending'),
      apiAdminGetSettings()
    ])
      .then(([statsRes, reqRes, settingsRes]) => {
        setStats(statsRes.stats);
        setPendingRequests(reqRes.requests.slice(0, 5));
        setEmail(settingsRes.settings?.email || 'contact@jmlamaroc.com');
        setPhoneNumber(settingsRes.settings?.phoneNumber || '0779 137 560');
        setWhatsappNumber(settingsRes.settings?.whatsappNumber || '212779137560');
        setInstagramLink(settingsRes.settings?.instagramLink || 'https://instagram.com');
        setFacebookLink(settingsRes.settings?.facebookLink || 'https://facebook.com');
        setLinkedinLink(settingsRes.settings?.linkedinLink || 'https://linkedin.com');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await apiAdminUpdateSettings({
        email,
        phoneNumber,
        whatsappNumber,
        instagramLink,
        facebookLink,
        linkedinLink
      });
      if (res.success) {
        toast.success('Site settings updated successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-[#E85D04] border-t-transparent rounded-full" />
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <AlertCircle className="text-red-500" />
        <div>
          <p className="font-semibold text-red-700">Login Again</p>
          <p className="text-sm text-red-600">{error}</p>
          <p className="text-xs text-red-500 mt-1">Your session has been expired</p>
        </div>
      </div>
    </div>
  );

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: '#E85D04', sub: `${stats?.buyers || 0} buyers · ${stats?.suppliers || 0} suppliers` },
    { label: 'Pending Users', value: stats?.pendingUsers || 0, icon: RefreshCw, color: stats?.pendingUsers ? '#E8820C' : '#E85D04', sub: 'Awaiting approval', urgent: (stats?.pendingUsers || 0) > 0 },
    { label: 'Active Stores', value: stats?.totalStores || 0, icon: Store, color: '#E85D04', sub: 'Approved stores' },
    { label: 'Pending Requests', value: stats?.pendingRequests || 0, icon: ClipboardList, color: stats?.pendingRequests ? '#E8820C' : '#E85D04', sub: 'Supplier requests', urgent: (stats?.pendingRequests || 0) > 0 },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Dashboard</h1>
        <p className="text-sm text-[#888888]">Welcome back, Admin.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div
            key={card.label}
            className={`bg-white rounded-xl border p-5 ${card.urgent ? 'border-orange-300 shadow-sm shadow-orange-100' : 'border-[#CCCCCC]'}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: card.urgent ? '#FFF8E1' : '#FFF2EB' }}>
                <card.icon size={20} style={{ color: card.color }} />
              </div>
              {card.urgent && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#E8820C' }}>
                  NEW
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-[#1A1A1A]">{card.value.toLocaleString()}</p>
            <p className="text-sm font-medium text-[#444444] mt-0.5">{card.label}</p>
            <p className="text-xs text-[#888888] mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Pending supplier requests */}
      <div className="bg-white rounded-xl border border-[#CCCCCC] overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5F5F5]">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} style={{ color: '#E85D04' }} />
            <h2 className="font-semibold text-[#1A1A1A]">Pending Supplier Requests</h2>
            {pendingRequests.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#E8820C' }}>
                {pendingRequests.length}
              </span>
            )}
          </div>
          <button
            onClick={() => navigate('/admin/requests')}
            className="flex items-center gap-1 text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: '#E85D04' }}
          >
            View all <ArrowRight size={14} />
          </button>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="py-10 text-center">
            <TrendingUp size={32} className="mx-auto mb-2 text-[#CCCCCC]" />
            <p className="text-sm text-[#888888]">No pending requests. You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F5F5F5]">
            {pendingRequests.map(req => (
              <div key={req._id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F9F9F9] transition-colors">
                <div
                  style={{ backgroundColor: '#E85D04' }}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                >
                  {req.user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">{req.businessName}</p>
                  <p className="text-xs text-[#888888]">{req.user?.name} · @{req.storeHandle} · {req.category} · {req.city}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-[#888888]">{new Date(req.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => navigate('/admin/requests')}
                    className="px-3 py-1.5 rounded-lg text-white text-xs font-medium hover:opacity-90"
                    style={{ backgroundColor: '#E85D04' }}
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Site Configuration Settings (Email, Phone, WhatsApp & Socials) */}
      <div className="bg-white rounded-xl border border-[#CCCCCC] overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5F5F5]">
          <div className="flex items-center gap-2">
            <Mail size={18} style={{ color: '#E85D04' }} />
            <h2 className="font-semibold text-[#1A1A1A]">Site Platform settings</h2>
          </div>
        </div>

        <div className="p-5 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#888888] uppercase mb-1.5 flex items-center gap-1.5">
              <Mail size={12} /> Contact Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. contact@jmlamaroc.com"
              className="w-full bg-[#F5F5F5] border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#888888] focus:outline-none focus:border-[#E85D04] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#888888] uppercase mb-1.5 flex items-center gap-1.5">
              <Phone size={12} /> Display Phone Number
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="e.g. 0779 137 560"
              className="w-full bg-[#F5F5F5] border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#888888] focus:outline-none focus:border-[#E85D04] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#888888] uppercase mb-1.5 flex items-center gap-1.5">
              <Phone size={12} /> WhatsApp Number (for links, e.g. 212779137560)
            </label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={e => setWhatsappNumber(e.target.value)}
              placeholder="e.g. 212779137560"
              className="w-full bg-[#F5F5F5] border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#888888] focus:outline-none focus:border-[#E85D04] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#888888] uppercase mb-1.5 flex items-center gap-1.5">
              <Globe size={12} /> Instagram Link
            </label>
            <input
              type="text"
              value={instagramLink}
              onChange={e => setInstagramLink(e.target.value)}
              placeholder="e.g. https://instagram.com/..."
              className="w-full bg-[#F5F5F5] border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#888888] focus:outline-none focus:border-[#E85D04] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#888888] uppercase mb-1.5 flex items-center gap-1.5">
              <Globe size={12} /> Facebook Link
            </label>
            <input
              type="text"
              value={facebookLink}
              onChange={e => setFacebookLink(e.target.value)}
              placeholder="e.g. https://facebook.com/..."
              className="w-full bg-[#F5F5F5] border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#888888] focus:outline-none focus:border-[#E85D04] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#888888] uppercase mb-1.5 flex items-center gap-1.5">
              <Globe size={12} /> LinkedIn Link
            </label>
            <input
              type="text"
              value={linkedinLink}
              onChange={e => setLinkedinLink(e.target.value)}
              placeholder="e.g. https://linkedin.com/in/..."
              className="w-full bg-[#F5F5F5] border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#888888] focus:outline-none focus:border-[#E85D04] transition-all"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end mt-2">
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm shadow-md transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#E85D04' }}
            >
              {savingSettings ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Save size={16} />
              )}
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* Quick nav cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { title: 'Review Requests', desc: 'Approve or reject supplier applications', to: '/admin/requests', color: '#E8820C' },
          { title: 'Manage Stores', desc: 'View, activate, or deactivate stores', to: '/admin/stores', color: '#E85D04' },
          { title: 'Manage Users', desc: 'View and manage platform users', to: '/admin/users', color: '#E85D04' },
        ].map(card => (
          <button
            key={card.to}
            onClick={() => navigate(card.to)}
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#CCCCCC] hover:border-[#E85D04] transition-colors text-left group"
          >
            <div>
              <p className="font-semibold text-[#1A1A1A]">{card.title}</p>
              <p className="text-xs text-[#888888] mt-0.5">{card.desc}</p>
            </div>
            <ArrowRight size={16} className="text-[#888888] group-hover:text-[#E85D04] transition-colors shrink-0 ml-2" />
          </button>
        ))}
      </div>
    </div>
  );
}
