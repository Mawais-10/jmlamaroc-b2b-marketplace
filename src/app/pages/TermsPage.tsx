import { Link } from 'react-router';
import { FileText, ArrowLeft, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';

export default function TermsPage() {
  const { siteEmail, sitePhone } = useApp();
  const { language } = useTranslation();

  const isAr = language === 'ar';
  const isFr = language === 'fr';

  const content = {
    title: isAr ? 'شروط الاستخدام' : isFr ? "Conditions d'utilisation" : 'Terms of Use',
    goHome: isAr ? 'الرجوع للرئيسية' : isFr ? "Retour à l'accueil" : 'Back to Home',
    subTitle: isAr ? 'مرحباً بكم في منصة JML Maroc' : isFr ? 'Bienvenue sur la plateforme JML Maroc' : 'Welcome to the JML Maroc Platform',
    desc: isAr 
      ? 'باستخدامكم لمنصتنا، فإنكم توافقون على الالتزام بالشروط والأحكام التالية. يرجى قراءتها بعناية قبل البدء في استخدام الخدمات.' 
      : isFr 
      ? "En utilisant notre plateforme, vous acceptez de respecter les conditions générales suivantes. Veuillez les lire attentivement avant d'utiliser nos services." 
      : 'By using our platform, you agree to comply with the following terms and conditions. Please read them carefully before using the services.',
    
    sec1Title: isAr ? '1. تعريف بالخدمة' : isFr ? '1. Présentation du service' : '1. Definition of Service',
    sec1Desc: isAr
      ? 'منصة JML Maroc هي عبارة عن دليل وسوق B2B رقمي يربط بين تجار التجزئة والموردين/موردي الجملة في المغرب. نحن نسهل عملية العثور على المنتجات والموردين باستخدام الذكاء الاصطناعي والتواصل المباشر.'
      : isFr
      ? 'La plateforme JML Maroc est un annuaire et marché B2B numérique qui met en relation les détaillants et les grossistes au Maroc. Nous facilitons la recherche de produits et de fournisseurs grâce à l\'intelligence artificielle et au contact direct.'
      : 'The JML Maroc platform is a B2B digital directory and marketplace that connects retailers and wholesalers in Morocco. We facilitate sourcing products and suppliers using artificial intelligence and direct communication.',

    sec2Title: isAr ? '2. شروط التسجيل والاستخدام' : isFr ? "2. Conditions d'inscription et d'utilisation" : '2. Registration & Usage Conditions',
    sec2List: isAr
      ? [
          'يجب أن تكون المعلومات المقدمة أثناء التسجيل دقيقة وصحيحة بالكامل.',
          'يتحمل المستخدم المسؤولية الكاملة عن سرية بيانات حسابه وكلمة المرور الخاصة به.',
          'يُمنع منعاً باتاً استخدام المنصة لأي أغراض غير قانونية أو احتيالية.'
        ]
      : isFr
      ? [
          'Les informations fournies lors de l\'inscription doivent être exactes et complètes.',
          'L\'utilisateur assume l\'entière responsabilité de la confidentialité de son compte et de son mot de passe.',
          'Il est strictement interdit d\'utiliser la plateforme à des fins illégales ou frauduleuses.'
        ]
      : [
          'All information provided during registration must be completely accurate and correct.',
          'The user assumes full responsibility for the confidentiality of their account details and password.',
          'It is strictly forbidden to use the platform for any illegal or fraudulent purposes.'
        ],

    sec3Title: isAr ? '3. التزامات الموردين (Suppliers)' : isFr ? '3. Obligations des fournisseurs (Suppliers)' : '3. Supplier Obligations',
    sec3Desc: isAr ? 'يلتزم الموردون المسجلون بالمنصة بما يلي:' : isFr ? 'Les fournisseurs enregistrés sur la plateforme s\'engagent à :' : 'Suppliers registered on the platform are committed to:',
    sec3List: isAr
      ? [
          'عرض منتجات حقيقية ومتوفرة لديهم بالفعل.',
          'تقديم أسعار حقيقية وغير مضللة لتجار الجملة والتجزئة.',
          'احترام معايير التجارة وحقوق الملكية الفكرية للمنتجات المعروضة.'
        ]
      : isFr
      ? [
          'Proposer des produits réels et effectivement disponibles.',
          'Fournir des prix réels et non trompeurs pour les grossistes et détaillants.',
          'Respecter les normes commerciales et les droits de propriété intellectuelle des produits présentés.'
        ]
      : [
          'Displaying real and currently available products.',
          'Providing genuine and non-misleading prices to retailers and wholesalers.',
          'Respecting trade standards and intellectual property rights for all featured products.'
        ],

    sec4Title: isAr ? '4. حدود المسؤولية' : isFr ? '4. Limites de responsabilité' : '4. Limitation of Liability',
    sec4Desc: isAr 
      ? 'تعتبر منصة JML Maroc وسيطاً تقنياً يربط بين البائع والمشتري بشكل مباشر، وبالتالي:' 
      : isFr 
      ? 'JML Maroc agit en tant qu\'intermédiaire technique connectant le vendeur et l\'acheteur directement. Par conséquent :' 
      : 'JML Maroc serves as a technical intermediary directly connecting buyers and sellers; therefore:',
    sec4List: isAr
      ? [
          'لا نتحمل أي مسؤولية عن جودة المنتجات، عمليات التوصيل، أو المعاملات المالية المباشرة التي تتم بين الأطراف خارج المنصة.',
          'ننصح دائماً بالتحقق المباشر والتواصل عبر القنوات الرسمية والآمنة.'
        ]
      : isFr
      ? [
          'Nous n\'assumons aucune responsabilité quant à la qualité des produits, la livraison ou les transactions financières directes effectuées en dehors de la plateforme.',
          'Nous vous conseillons toujours de vérifier directement et de communiquer par des canaux sécurisés.'
        ]
      : [
          'We assume no liability for product quality, delivery operations, or direct financial transactions conducted outside of the platform.',
          'We always advise verifying details directly and communicating via official, secure channels.'
        ],

    sec5Title: isAr ? '5. تعديل الشروط والأحكام' : isFr ? '5. Modification des Conditions Générales' : '5. Modification of Terms',
    sec5Desc: isAr 
      ? 'نحتفظ بالحق في تعديل أو تحديث هذه الشروط في أي وقت. سيتم نشر التغييرات مباشرة على هذه الصفحة ويسري مفعولها فور النشر.' 
      : isFr 
      ? 'Nous nous réservons le droit de modifier ou de mettre à jour ces conditions à tout moment. Les modifications seront publiées sur cette page et prendront effet immédiatement.' 
      : 'We reserve the right to modify or update these terms at any time. Changes will be posted directly to this page and take effect immediately.',

    sec6Title: isAr ? '6. التواصل معنا' : isFr ? '6. Contactez-nous' : '6. Contact Us',
    sec6Desc: isAr 
      ? 'إذا كان لديكم أي استفسار بخصوص شروط الاستخدام، يمكنك التواصل معنا مباشرة عبر WhatsApp على الرقم: ' 
      : isFr 
      ? 'Si vous avez des questions concernant les conditions d\'utilisation, vous pouvez nous contacter directement par WhatsApp au numéro : ' 
      : 'If you have any questions regarding the Terms of Use, you can contact us directly via WhatsApp at: '
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
        
        {/* Header */}
        <div className={`flex items-center justify-between mb-8 border-b border-gray-100 pb-6 ${isAr ? 'flex-row' : 'flex-row-reverse'}`}>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-[#E85D04] hover:underline font-semibold">
            {!isAr ? <ArrowLeft size={16} /> : null}
            {content.goHome}
            {isAr ? <ArrowRight size={16} /> : null}
          </Link>
          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: '#FFF2EB' }} className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#E85D04]">
              <FileText size={24} />
            </div>
            <div className={isAr ? 'text-right' : 'text-left'}>
              <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
              <p className="text-sm text-gray-500 mt-1">JML Maroc | {isAr ? 'شروط وأحكام الاستخدام' : isFr ? "Conditions Générales d'Utilisation" : 'Terms & Conditions'}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`space-y-6 text-gray-700 leading-relaxed text-sm ${isAr ? 'text-right' : 'text-left'}`}>
          <p className="font-semibold text-base text-gray-900">{content.subTitle}</p>
          <p>{content.desc}</p>

          <h2 className="text-lg font-bold text-gray-900 pt-4">{content.sec1Title}</h2>
          <p>{content.sec1Desc}</p>

          <h2 className="text-lg font-bold text-gray-900 pt-4">{content.sec2Title}</h2>
          <ul className={`list-disc list-inside space-y-2 ${isAr ? 'pr-4' : 'pl-4'}`}>
            {content.sec2List.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>

          <h2 className="text-lg font-bold text-gray-900 pt-4">{content.sec3Title}</h2>
          <p>{content.sec3Desc}</p>
          <ul className={`list-disc list-inside space-y-2 ${isAr ? 'pr-4' : 'pl-4'}`}>
            {content.sec3List.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>

          <h2 className="text-lg font-bold text-gray-900 pt-4">{content.sec4Title}</h2>
          <p>{content.sec4Desc}</p>
          <ul className={`list-disc list-inside space-y-2 ${isAr ? 'pr-4' : 'pl-4'}`}>
            {content.sec4List.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>

          <h2 className="text-lg font-bold text-gray-900 pt-4">{content.sec5Title}</h2>
          <p>{content.sec5Desc}</p>

          <h2 className="text-lg font-bold text-gray-900 pt-4">{content.sec6Title}</h2>
          <p>
            {content.sec6Desc}
            <strong>{sitePhone}</strong>
            {isAr ? ' أو عبر البريد الإلكتروني: ' : isFr ? ' ou par e-mail : ' : ' or via email at: '}
            <strong>{siteEmail}</strong>.
          </p>
        </div>

      </div>
    </div>
  );
}
