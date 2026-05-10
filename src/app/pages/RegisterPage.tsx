import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, loginWithGoogle } = useApp();
  const navigate = useNavigate();

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : password.match(/[A-Z]/) && password.match(/[0-9]/) ? 4 : 3;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#CC0000', '#E8820C', '#1A7A5E', '#1A7A5E'];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) { setError('Please fill in all fields'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const ok = await register(name, email, password);
      if (ok) {
        toast.success('Account created successfully!');
        navigate('/search');
      } else {
        setError('Registration failed. Email may already be in use.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();

        const ok = await loginWithGoogle('', {
          sub: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture
        });
        if (ok) {
          toast.success('Account created with Google!');
          navigate('/search');
        } else {
          setError('Google sign-up failed on server');
        }
      } catch {
        setError('Google sign-up failed. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => toast.error('Google sign-up was cancelled.'),
  });

  return (
    <div className="min-h-screen flex">
      {/* Left - marketing */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12" style={{ backgroundColor: '#1E3A30' }}>
        <div className="flex items-center gap-2 mb-10">
          <div style={{ backgroundColor: '#1A7A5E' }} className="w-10 h-10 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <div>
            <span className="text-white text-xl font-bold">ChouFliya</span>
            <p className="text-xs tracking-widest font-bold" style={{ color: '#E8820C' }}>CHOUFLIYA.MA</p>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4 leading-tight">Join Morocco's largest wholesale marketplace</h2>
        <p className="text-[#E8F5F0] opacity-80 mb-8">Search 1M+ wholesale products, save favorites, build sourcing collections, and connect with suppliers directly.</p>
        <ul className="space-y-3">
          {['Free to use', 'AI-powered image search', 'Direct supplier contacts', 'Build sourcing collections', 'Become a verified supplier'].map(item => (
            <li key={item} className="flex items-center gap-2 text-[#E8F5F0] opacity-80 text-sm">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: '#1A7A5E' }}>✓</span>
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-10 flex items-center gap-2 text-[#E8F5F0] opacity-50 text-sm">
          <Shield size={16} />
          <span>Secured with JWT + Google OAuth 2.0</span>
        </div>
      </div>

      {/* Right - form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">Create your account</h1>
            <p className="text-sm text-[#888888]">Join thousands of retailers on ChouFliya</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 mb-4">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Google button */}
          <button
            onClick={() => handleGoogleRegister()}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 border border-[#CCCCCC] rounded-xl text-sm font-medium text-[#444444] hover:bg-[#F5F5F5] transition-colors mb-5 disabled:opacity-60"
          >
            {googleLoading ? (
              <span className="animate-spin w-4 h-4 border-2 border-[#1A7A5E] border-t-transparent rounded-full" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {googleLoading ? 'Creating account...' : 'Sign up with Google'}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#CCCCCC]"></div>
            <span className="text-xs font-semibold text-[#888888] tracking-wider">OR CONTINUE WITH EMAIL</span>
            <div className="flex-1 h-px bg-[#CCCCCC]"></div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#444444] mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A7A5E] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#444444] mb-1.5">Email address</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="you@example.com"
                className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A7A5E] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#444444] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Choose a strong password"
                  className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#1A7A5E] transition-colors" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#444444]">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(level => (
                      <div key={level} className="flex-1 h-1 rounded-full transition-colors"
                        style={{ backgroundColor: level <= strength ? strengthColor[strength] : '#CCCCCC' }} />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strengthColor[strength] }}>{strengthLabel[strength]}</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#444444] mb-1.5">Confirm Password</label>
              <input type={showPw ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter your password"
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${confirm && confirm !== password ? 'border-red-400 focus:border-red-400' : 'border-[#CCCCCC] focus:border-[#1A7A5E]'}`} />
              {confirm && confirm !== password && <p className="text-xs text-red-500 mt-1">Passwords don't match</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              style={{ backgroundColor: '#1A7A5E' }}>
              {loading ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-[#888888] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:opacity-80" style={{ color: '#1A7A5E' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
