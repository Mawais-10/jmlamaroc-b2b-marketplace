import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Store, CheckCircle, Clock, XCircle, AlertCircle, Send, Phone, AtSign, MapPin, Tag, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiApplySupplier, apiGetSupplierRequestStatus, ApiSupplierRequest } from '../services/api';
import { CATEGORIES } from '../data/mockData';
import { toast } from 'sonner';

const MOROCCAN_CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier', 'Agadir', 'Meknes', 'Oujda', 'Kenitra', 'Tetouan', 'Safi', 'Mohammedia', 'Other'];

export default function SupplierApplyPage() {
  const { user } = useApp();
  const navigate = useNavigate();

  const [existingRequest, setExistingRequest] = useState<ApiSupplierRequest | null>(null);
  const [checkLoading, setCheckLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    businessName: '',
    storeHandle: '',
    description: '',
    category: '',
    city: '',
    whatsappNumber: '',
    telegramHandle: '',
    message: '',
  });

  useEffect(() => {
    if (!user) { navigate('/login?redirect=/apply-supplier'); return; }
    if (user.role === 'supplier') { navigate('/store/dashboard'); return; }
    if (user.role === 'admin') { navigate('/admin'); return; }

    apiGetSupplierRequestStatus()
      .then(res => setExistingRequest(res.request))
      .catch(() => { })
      .finally(() => setCheckLoading(false));
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Auto-generate handle from business name
    if (name === 'businessName') {
      const handle = value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 30);
      setForm(prev => ({ ...prev, businessName: value, storeHandle: handle }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName || !form.storeHandle || !form.category || !form.city || !form.whatsappNumber) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await apiApplySupplier(form);
      toast.success('Application submitted! Admin will review it shortly.');
      const res = await apiGetSupplierRequestStatus();
      setExistingRequest(res.request);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (checkLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#E85D04] border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show status if already applied
  if (existingRequest) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-[#CCCCCC] p-8 max-w-md w-full text-center">
          {existingRequest.status === 'pending' && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#FFF8E1' }}>
                <Clock size={32} style={{ color: '#E8820C' }} />
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Application Under Review</h2>
              <p className="text-[#888888] text-sm mb-4">
                Your application for <strong>{existingRequest.businessName}</strong> is being reviewed by our admin team.
                You'll be notified once a decision is made.
              </p>
              <div className="p-3 rounded-xl text-left" style={{ backgroundColor: '#FFF8E1' }}>
                <p className="text-xs text-[#888888]">Submitted on {new Date(existingRequest.createdAt).toLocaleDateString()}</p>
                <p className="text-sm font-medium text-[#444444] mt-1">Store: @{existingRequest.storeHandle}</p>
              </div>
            </>
          )}
          {existingRequest.status === 'approved' && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#FFF2EB' }}>
                <CheckCircle size={32} style={{ color: '#E85D04' }} />
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Application Approved! 🎉</h2>
              <p className="text-[#888888] text-sm mb-6">
                Congratulations! Your store <strong>@{existingRequest.storeHandle}</strong> has been approved.
                Start setting up your store and adding products.
              </p>
              <button
                onClick={() => navigate('/store/dashboard')}
                className="w-full py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#E85D04' }}
              >
                Go to My Store Dashboard
              </button>
            </>
          )}
          {existingRequest.status === 'rejected' && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#FEF2F2' }}>
                <XCircle size={32} className="text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Application Rejected</h2>
              <p className="text-[#888888] text-sm mb-4">
                Unfortunately, your supplier application was rejected.
              </p>
              {existingRequest.adminNote && (
                <div className="p-3 rounded-xl text-left bg-red-50 border border-red-200 mb-4">
                  <p className="text-xs font-medium text-red-600">Admin note:</p>
                  <p className="text-sm text-red-700 mt-1">{existingRequest.adminNote}</p>
                </div>
              )}
              <p className="text-xs text-[#888888]">You may contact support for more information.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#CCCCCC] px-6 py-5">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: '#FFF2EB' }} className="p-2 rounded-xl">
              <Store size={22} style={{ color: '#E85D04' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Become a Supplier</h1>
              <p className="text-sm text-[#888888]">Apply to list your wholesale business on JML Maroc</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Info banner */}
        {/* <div className="flex items-start gap-3 p-4 rounded-xl mb-6" style={{ backgroundColor: '#FFF2EB', borderLeft: '4px solid #E85D04' }}>
          <AlertCircle size={18} style={{ color: '#E85D04' }} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium" style={{ color: '#E85D04' }}>How it works</p>
            <p className="text-xs text-[#444444] mt-1">
              Fill out this form → Our admin reviews your application (usually within 24h) → If approved, you'll get access to your supplier dashboard where you can set up your store, upload products via Cloudinary, and set your Telegram/WhatsApp contact.
            </p>
          </div>
        </div> */}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#CCCCCC] p-6 space-y-5">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Business Information</h2>

          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium text-[#444444] mb-1.5">
              <FileText size={14} className="inline mr-1.5" />
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              placeholder="e.g. Atlas Fashion House"
              className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04] transition-colors"
            />
          </div>

          {/* Store Handle */}
          <div>
            <label className="block text-sm font-medium text-[#444444] mb-1.5">
              <AtSign size={14} className="inline mr-1.5" />
              Store Handle (URL) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-[#CCCCCC] rounded-xl overflow-hidden focus-within:border-[#E85D04] transition-colors">
              <span className="px-3 py-3 bg-[#F5F5F5] text-sm text-[#888888] border-r border-[#CCCCCC]">jmlmaroc.ma/@</span>
              <input
                name="storeHandle"
                value={form.storeHandle}
                onChange={handleChange}
                placeholder="your_store_name"
                pattern="[a-z0-9_]+"
                className="flex-1 px-4 py-3 text-sm focus:outline-none bg-white"
              />
            </div>
            <p className="text-xs text-[#888888] mt-1">Only lowercase letters, numbers, and underscores. This can't be changed later.</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#444444] mb-1.5">Store Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your wholesale business, products, specialties..."
              rows={3}
              className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04] transition-colors resize-none"
            />
          </div>

          {/* Category + City */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#444444] mb-1.5">
                <Tag size={14} className="inline mr-1.5" />
                Main Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04] transition-colors bg-white"
              >
                <option value="">Select category</option>
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#444444] mb-1.5">
                <MapPin size={14} className="inline mr-1.5" />
                City <span className="text-red-500">*</span>
              </label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04] transition-colors bg-white"
              >
                <option value="">Select city</option>
                {MOROCCAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <hr className="border-[#F5F5F5]" />
          <h2 className="text-lg font-bold text-[#1A1A1A]">Contact Information</h2>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-[#444444] mb-1.5">
              <Phone size={14} className="inline mr-1.5 text-[#25D366]" />
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-[#CCCCCC] rounded-xl overflow-hidden focus-within:border-[#E85D04] transition-colors">
              <span className="px-3 py-3 bg-[#F5F5F5] text-sm text-[#888888] border-r border-[#CCCCCC]">+212</span>
              <input
                name="whatsappNumber"
                value={form.whatsappNumber}
                onChange={handleChange}
                placeholder="661234567"
                type="tel"
                className="flex-1 px-4 py-3 text-sm focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* Telegram */}
          <div>
            <label className="block text-sm font-medium text-[#444444] mb-1.5">
              <Send size={14} className="inline mr-1.5 text-[#229ED9]" />
              Telegram Username (optional)
            </label>
            <div className="flex items-center border border-[#CCCCCC] rounded-xl overflow-hidden focus-within:border-[#E85D04] transition-colors">
              <span className="px-3 py-3 bg-[#F5F5F5] text-sm text-[#888888] border-r border-[#CCCCCC]">@</span>
              <input
                name="telegramHandle"
                value={form.telegramHandle}
                onChange={handleChange}
                placeholder="your_telegram"
                className="flex-1 px-4 py-3 text-sm focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-[#444444] mb-1.5">Additional Message (optional)</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Any additional information for the admin..."
              rows={2}
              className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04] transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#E85D04' }}
          >
            {loading ? (
              <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Submitting...</>
            ) : (
              <><Store size={18} /> Submit Application</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
