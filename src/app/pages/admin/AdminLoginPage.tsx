import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('choufliya_admin_token');
    if (token) navigate('/admin');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter email and password'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || 'Login failed'); setLoading(false); return; }
      if (data.user.role !== 'admin') {
        setError('Access denied. Admin account required.');
        setLoading(false);
        return;
      }
      localStorage.setItem('choufliya_admin_token', data.token);
      toast.success('Welcome to ChouFliya Admin!');
      navigate('/admin');
    } catch {
      setError('Cannot connect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center " style={{ backgroundColor: '#1E3A30' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ backgroundColor: '#1A7A5E' }}>
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p style={{ color: '#E8820C' }} className="text-sm mt-1">ChouFliya · Wholesale Platform</p>
        </div>

        <div className="bg-white rounded-2xl p-8">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 mb-4">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#444444] mb-1.5">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="admin@choufliya.com"
                className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A7A5E] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#444444] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Admin password"
                  className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#1A7A5E] transition-colors"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888]">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#1A7A5E' }}
            >
              {loading ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Signing in...</> : 'Access Admin Panel'}
            </button>
          </form>

          {/* <div className="mt-5 p-3 rounded-xl text-xs" style={{ backgroundColor: '#F0F9F5', color: '#1A7A5E' }}>
            <p className="font-semibold mb-1">⚙️ First time setup:</p>
            <p>Run <code className="bg-white px-1 rounded">cd server && npm install && node seed.js</code> to create the admin account.</p>
          </div> */}
        </div>

        <p className="text-center text-xs text-white/40 mt-4">
          This panel is for authorized administrators only.
        </p>
      </div>
    </div>
  );
}
