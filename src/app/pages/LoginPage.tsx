import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Eye, EyeOff, Shield, Package, Users, Zap, AlertCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { apiGoogleAuth } from '../services/api';
import { useTranslation } from '../i18n/useTranslation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useApp();
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/search';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { 
      setError(language === 'ar' ? 'يرجى ملء جميع الحقول' : language === 'fr' ? 'Veuillez remplir tous les champs' : 'Please fill in all fields'); 
      return; 
    }
    setLoading(true);
    try {
      const ok = await login(email, password);
      if (ok) {
        toast.success(language === 'ar' ? 'مرحباً بعودتك!' : language === 'fr' ? 'Bon retour !' : 'Welcome back!');
        navigate(redirect);
      } else {
        setError(language === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صالحة. يرجى المحاولة مرة أخرى.' : language === 'fr' ? 'E-mail ou mot de passe invalide. Veuillez réessayer.' : 'Invalid email or password. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || (language === 'ar' ? 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.' : language === 'fr' ? 'Échec de la connexion. Veuillez réessayer.' : 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth using @react-oauth/google
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        // Exchange access token for user info, then send to backend
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();

        try {
          const ok = await loginWithGoogle('', {
            sub: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture
          });
          if (ok) {
            toast.success(language === 'ar' ? 'تم تسجيل الدخول باستخدام Google!' : language === 'fr' ? 'Connecté avec Google !' : 'Signed in with Google!');
            navigate(redirect);
          } else {
            toast.error(language === 'ar' ? 'تم رفض تسجيل الدخول بواسطة Google' : language === 'fr' ? 'Connexion Google refusée par le backend' : 'Google sign-in rejected by backend');
          }
        } catch (err: any) {
          toast.error('Auth Error: ' + (err.message || 'Unknown error'));
        }
      } catch {
        toast.error(language === 'ar' ? 'فشل تسجيل الدخول باستخدام Google. حاول مرة أخرى.' : language === 'fr' ? 'Échec de la connexion Google. Veuillez réessayer.' : 'Google sign-in failed. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error(language === 'ar' ? 'تم إلغاء تسجيل الدخول باستخدام Google أو فشله.' : language === 'fr' ? 'La connexion Google a été annulée ou a échoué.' : 'Google sign-in was cancelled or failed.');
    },
  });

  return (
    <div className="min-h-screen flex">
      {/* Left column - marketing */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ backgroundColor: '#3E1A0A' }}>
        <div>
          {/* Logo */}
          <div className="mb-12">
            <img src="/images/Logo.png" alt="Logo" className="w-20 h-20 rounded-2xl object-contain" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            {language === 'ar' ? 'أكبر منصة لبيع الجملة في المغرب' : language === 'fr' ? 'La plus grande plateforme de gros du Maroc' : 'Morocco\'s largest wholesale platform'}
          </h2>
          <p className="text-[#FFF2EB] opacity-80 text-base leading-relaxed mb-10">
            {language === 'ar' ? 'التقط صورة لأي منتج واعثر على المورد في ثوانٍ. بدون وسطاء.' : language === 'fr' ? 'Photographiez n\'importe quel produit et trouvez son grossiste en quelques secondes.' : 'Snap any product and find every wholesaler selling it, in seconds. No middlemen.'}
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: Package, value: '1M+', label: language === 'ar' ? 'منتجات' : language === 'fr' ? 'Produits' : 'Products' },
              { icon: Users, value: '100+', label: language === 'ar' ? 'تجار جملة' : language === 'fr' ? 'Grossistes' : 'Wholesalers' },
              { icon: Zap, value: '<1s', label: language === 'ar' ? 'سرعة البحث' : language === 'fr' ? 'Vitesse de recherche' : 'Search Speed' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="rounded-xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <Icon size={20} className="mb-2 text-white opacity-70" />
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-[#FFF2EB] opacity-60">{label}</p>
              </div>
            ))}
          </div>

          {/* <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(232,130,12,0.15)', borderLeft: '3px solid #E8820C' }}>
            <p className="text-sm text-[#FFF2EB] opacity-80">
              <span className="font-semibold text-[#E8820C]">Admin Panel:</span> Access at{' '}
              <code className="text-white">http://localhost:5000</code> after running the backend server.
            </p>
          </div> */}
        </div>

        <div className="flex items-center gap-2 text-[#FFF2EB] opacity-60 text-sm">
          <Shield size={16} />
          <span>{language === 'ar' ? 'مؤمن باستخدام JWT + Google OAuth' : language === 'fr' ? 'Sécurisé avec JWT + Google OAuth' : 'Secured with JWT + Google OAuth'}</span>
        </div>
      </div>

      {/* Right column - auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">
              {language === 'ar' ? 'تسجيل الدخول إلى JML Maroc' : language === 'fr' ? 'Connexion à JML Maroc' : 'Sign in to JML Maroc'}
            </h1>
            <p className="text-sm text-[#888888]">
              {language === 'ar' ? 'مرحباً بعودتك! يرجى تسجيل الدخول إلى حسابك.' : language === 'fr' ? 'Bon retour ! Veuillez vous connecter à votre compte.' : 'Welcome back! Please sign in to your account.'}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 mb-4">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            onClick={() => handleGoogleLogin()}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 border border-[#CCCCCC] rounded-xl text-sm font-medium text-[#444444] hover:bg-[#F5F5F5] transition-colors mb-5 disabled:opacity-60"
          >
            {googleLoading ? (
              <span className="animate-spin w-4 h-4 border-2 border-[#E85D04] border-t-transparent rounded-full" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {googleLoading ? (language === 'ar' ? 'جاري الدخول...' : language === 'fr' ? 'Connexion...' : 'Signing in...') : (language === 'ar' ? 'الدخول باستخدام Google' : language === 'fr' ? 'Se connecter avec Google' : 'Sign in with Google')}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#CCCCCC]"></div>
            <span className="text-xs font-semibold text-[#888888] tracking-wider">
              {language === 'ar' ? 'أو تواصل عبر البريد الإلكتروني' : language === 'fr' ? 'OU CONTINUER PAR E-MAIL' : 'OR CONTINUE WITH EMAIL'}
            </span>
            <div className="flex-1 h-px bg-[#CCCCCC]"></div>
          </div>

          {/* Email form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#444444] mb-1.5">{t.common.email}</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#888888] focus:outline-none focus:border-[#E85D04] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#444444] mb-1.5">
                {language === 'ar' ? 'كلمة المرور' : language === 'fr' ? 'Mot de passe' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder={language === 'ar' ? 'أدخل كلمة المرور' : language === 'fr' ? 'Entrez votre mot de passe' : 'Enter your password'}
                  className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#888888] focus:outline-none focus:border-[#E85D04] transition-colors pr-12"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#444444] transition-colors">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#E85D04' }}
            >
              {loading ? (
                <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> {language === 'ar' ? 'جاري الدخول...' : language === 'fr' ? 'Connexion...' : 'Signing in...'}</>
              ) : t.nav.login}
            </button>
          </form>

          <p className="text-center text-sm text-[#888888] mt-6">
            {language === 'ar' ? 'ليس لديك حساب؟' : language === 'fr' ? 'Pas encore de compte ?' : 'Don\'t have an account?'}{' '}
            <Link to="/register" className="font-semibold hover:opacity-80" style={{ color: '#E85D04' }}>
              {language === 'ar' ? 'أنشئ حساباً' : language === 'fr' ? 'Créer un compte' : 'Create one'}
            </Link>
          </p>

          {/* Admin link */}
          <div className="mt-6 pt-4 border-t border-[#F5F5F5] text-center">
            <Link to="/admin" className="text-xs text-[#888888] hover:text-[#E85D04] transition-colors">
              {language === 'ar' ? 'لوحة التحكم للمسؤول ←' : language === 'fr' ? 'Panneau d\'administration →' : 'Admin Panel →'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
