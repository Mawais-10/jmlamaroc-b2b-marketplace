import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { useTranslation } from '../i18n/useTranslation';

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
  const { t, language } = useTranslation();
  const navigate = useNavigate();

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : password.match(/[A-Z]/) && password.match(/[0-9]/) ? 4 : 3;
  const strengthLabel = ['', 
    language === 'ar' ? 'ضعيفة' : language === 'fr' ? 'Faible' : 'Weak', 
    language === 'ar' ? 'مقبولة' : language === 'fr' ? 'Moyenne' : 'Fair', 
    language === 'ar' ? 'جيدة' : language === 'fr' ? 'Bonne' : 'Good', 
    language === 'ar' ? 'قوية' : language === 'fr' ? 'Forte' : 'Strong'
  ];
  const strengthColor = ['', '#CC0000', '#E8820C', '#E85D04', '#E85D04'];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) { 
      setError(language === 'ar' ? 'يرجى ملء جميع الحقول' : language === 'fr' ? 'Veuillez remplir tous les champs' : 'Please fill in all fields'); 
      return; 
    }
    if (password !== confirm) { 
      setError(language === 'ar' ? 'كلمات المرور غير متطابقة' : language === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match'); 
      return; 
    }
    if (password.length < 6) { 
      setError(language === 'ar' ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل' : language === 'fr' ? 'Le mot de passe doit contenir au moins 6 caractères' : 'Password must be at least 6 characters'); 
      return; 
    }
    setLoading(true);
    try {
      const ok = await register(name, email, password);
      if (ok) {
        toast.success(language === 'ar' ? 'تم إنشاء الحساب بنجاح!' : language === 'fr' ? 'Compte créé avec succès !' : 'Account created successfully!');
        navigate('/search');
      } else {
        setError(language === 'ar' ? 'فشل التسجيل. قد يكون البريد الإلكتروني مستخدماً بالفعل.' : language === 'fr' ? 'Échec de l\'inscription. L\'adresse e-mail est peut-être déjà utilisée.' : 'Registration failed. Email may already be in use.');
      }
    } catch (err: any) {
      setError(err.message || (language === 'ar' ? 'فشل التسجيل. يرجى المحاولة مرة أخرى.' : language === 'fr' ? 'Échec de l\'inscription. Veuillez réessayer.' : 'Registration failed. Please try again.'));
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
          toast.success(language === 'ar' ? 'تم إنشاء الحساب باستخدام Google!' : language === 'fr' ? 'Compte créé avec Google !' : 'Account created with Google!');
          navigate('/search');
        } else {
          setError(language === 'ar' ? 'فشل التسجيل عبر Google على الخادم' : language === 'fr' ? 'Échec de l\'inscription Google sur le serveur' : 'Google sign-up failed on server');
        }
      } catch {
        setError(language === 'ar' ? 'فشل التسجيل عبر Google. يرجى المحاولة مرة أخرى.' : language === 'fr' ? 'Échec de l\'inscription Google. Veuillez réessayer.' : 'Google sign-up failed. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => toast.error(language === 'ar' ? 'تم إلغاء التسجيل عبر Google.' : language === 'fr' ? 'L\'inscription Google a été annulée.' : 'Google sign-up was cancelled.'),
  });

  return (
    <div className="min-h-screen flex">
      {/* Left - marketing */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12" style={{ backgroundColor: '#3E1A0A' }}>
        <div className="mb-10">
          <img src="/images/Logo.png" alt="Logo" className="w-20 h-20 rounded-2xl object-contain" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
          {language === 'ar' ? 'انضم إلى أكبر سوق لبيع الجملة في المغرب' : language === 'fr' ? 'Rejoignez la plus grande place de marché de gros du Maroc' : 'Join Morocco\'s largest wholesale marketplace'}
        </h2>
        <p className="text-[#FFF2EB] opacity-80 mb-8">
          {language === 'ar' ? 'ابحث في أكثر من مليون منتج جملة، واحفظ المفضلة، وابنِ مجموعات التوريد، وتواصل مع الموردين مباشرة.' : language === 'fr' ? 'Recherchez parmi +1M de produits de gros, enregistrez vos favoris, créez des listes d\'achats et contactez les grossistes en direct.' : 'Search 1M+ wholesale products, save favorites, build sourcing collections, and connect with suppliers directly.'}
        </p>
        <ul className="space-y-3">
          {[
            language === 'ar' ? 'مجاني للاستخدام' : language === 'fr' ? 'Utilisation gratuite' : 'Free to use',
            language === 'ar' ? 'البحث بالصور بالذكاء الاصطناعي' : language === 'fr' ? 'Recherche d\'images par IA' : 'AI-powered image search',
            language === 'ar' ? 'اتصالات مباشرة مع الموردين' : language === 'fr' ? 'Contacts directs avec les grossistes' : 'Direct supplier contacts',
            language === 'ar' ? 'بناء مجموعات التوريد' : language === 'fr' ? 'Création de listes d\'achats' : 'Build sourcing collections',
            language === 'ar' ? 'كن مورداً معتمداً' : language === 'fr' ? 'Devenir fournisseur vérifié' : 'Become a verified supplier'
          ].map(item => (
            <li key={item} className="flex items-center gap-2 text-[#FFF2EB] opacity-80 text-sm">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: '#E85D04' }}>✓</span>
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-10 flex items-center gap-2 text-[#FFF2EB] opacity-50 text-sm">
          <Shield size={16} />
          <span>{language === 'ar' ? 'مؤمن باستخدام JWT + Google OAuth 2.0' : language === 'fr' ? 'Sécurisé avec JWT + Google OAuth 2.0' : 'Secured with JWT + Google OAuth 2.0'}</span>
        </div>
      </div>

      {/* Right - form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">
              {language === 'ar' ? 'إنشاء حساب جديد' : language === 'fr' ? 'Créer votre compte' : 'Create your account'}
            </h1>
            <p className="text-sm text-[#888888]">
              {language === 'ar' ? 'انضم إلى آلاف تجار التجزئة في JML Maroc' : language === 'fr' ? 'Rejoignez des milliers de détaillants sur JML Maroc' : 'Join thousands of retailers on JML Maroc'}
            </p>
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
              <span className="animate-spin w-4 h-4 border-2 border-[#E85D04] border-t-transparent rounded-full" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {googleLoading ? (language === 'ar' ? 'جاري إنشاء الحساب...' : language === 'fr' ? 'Création du compte...' : 'Creating account...') : (language === 'ar' ? 'التسجيل باستخدام Google' : language === 'fr' ? 'S\'inscrire avec Google' : 'Sign up with Google')}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#CCCCCC]"></div>
            <span className="text-xs font-semibold text-[#888888] tracking-wider">
              {language === 'ar' ? 'أو تواصل عبر البريد الإلكتروني' : language === 'fr' ? 'OU CONTINUER PAR E-MAIL' : 'OR CONTINUE WITH EMAIL'}
            </span>
            <div className="flex-1 h-px bg-[#CCCCCC]"></div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#444444] mb-1.5">
                {language === 'ar' ? 'الاسم الكامل' : language === 'fr' ? 'Nom complet' : 'Full Name'}
              </label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={language === 'ar' ? 'اسمك الكامل' : language === 'fr' ? 'Votre nom complet' : 'Your full name'}
                className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#444444] mb-1.5">{t.common.email}</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="you@example.com"
                className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#444444] mb-1.5">
                {language === 'ar' ? 'كلمة المرور' : language === 'fr' ? 'Mot de passe' : 'Password'}
              </label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={language === 'ar' ? 'اختر كلمة مرور قوية' : language === 'fr' ? 'Choisissez un mot de passe fort' : 'Choose a strong password'}
                  className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#E85D04] transition-colors" />
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
              <label className="block text-sm font-medium text-[#444444] mb-1.5">
                {language === 'ar' ? 'تأكيد كلمة المرور' : language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm Password'}
              </label>
              <input type={showPw ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={language === 'ar' ? 'أعد إدخال كلمة المرور' : language === 'fr' ? 'Ressaisissez le mot de passe' : 'Re-enter your password'}
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${confirm && confirm !== password ? 'border-red-400 focus:border-red-400' : 'border-[#CCCCCC] focus:border-[#E85D04]'}`} />
              {confirm && confirm !== password && <p className="text-xs text-red-500 mt-1">
                {language === 'ar' ? 'كلمات المرور غير متطابقة' : language === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords don\'t match'}
              </p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              style={{ backgroundColor: '#E85D04' }}>
              {loading ? (
                <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> {language === 'ar' ? 'جاري إنشاء الحساب...' : language === 'fr' ? 'Création du compte...' : 'Creating account...'}</>
              ) : (
                language === 'ar' ? 'إنشاء حساب' : language === 'fr' ? 'Créer le compte' : 'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#888888] mt-6">
            {language === 'ar' ? 'لديك حساب بالفعل؟' : language === 'fr' ? 'Vous avez déjà un compte ?' : 'Already have an account?'}{' '}
            <Link to="/login" className="font-semibold hover:opacity-80" style={{ color: '#E85D04' }}>
              {language === 'ar' ? 'تسجيل الدخول' : language === 'fr' ? 'Se connecter' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
