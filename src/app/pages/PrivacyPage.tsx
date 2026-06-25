import { Link } from 'react-router';
import { Shield, ArrowLeft, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';

export default function PrivacyPage() {
  const { siteEmail, sitePhone } = useApp();
  const { language } = useTranslation();

  const isAr = language === 'ar';
  const isFr = language === 'fr';

  const content = {
    title: isAr ? 'سياسة الخصوصية' : isFr ? 'Politique de confidentialité' : 'Privacy Policy',
    goHome: isAr ? 'الرجوع للرئيسية' : isFr ? "Retour à l'accueil" : 'Back to Home',
    subTitle: isAr 
      ? 'حماية بياناتك الشخصية وفقًا للقانون المغربي رقم 09-08' 
      : isFr 
      ? 'Protection de vos données personnelles conformément à la loi marocaine n° 09-08' 
      : 'Protection of your personal data in accordance with Moroccan Law No. 09-08',
    desc: isAr
      ? 'تلتزم منصة JML Maroc بحماية خصوصية مستخدميها وبياناتهم الشخصية وفقًا لأحكام القانون رقم 09-08 المتعلق بحماية الأشخاص الذاتيين تجاه معالجة المعطيات ذات الطابع الشخصي، والمعايير الدولية لحماية البيانات.'
      : isFr
      ? "La plateforme JML Maroc s'engage à protéger la vie privée de ses utilisateurs et leurs données personnelles conformément aux dispositions de la loi n° 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel, ainsi qu'aux normes internationales de protection des données."
      : 'The JML Maroc platform is committed to protecting the privacy of its users and their personal data in accordance with the provisions of Law No. 09-08 relating to the protection of individuals with regard to the processing of personal data, and international data protection standards.',
    
    sec1Title: isAr ? '1. المسؤول عن المعالجة' : isFr ? '1. Responsable du traitement' : '1. Data Controller',
    sec1Desc: isAr 
      ? 'الجهة المسؤولة عن معالجة بياناتكم الشخصية هي:' 
      : isFr 
      ? "L'entité responsable du traitement de vos données personnelles est :" 
      : 'The entity responsible for processing your personal data is:',
    sec1List: [
      isAr ? 'الاسم التجاري: JML Maroc' : isFr ? 'Nom commercial : JML Maroc' : 'Trade Name: JML Maroc',
      isAr ? 'العنوان: الدار البيضاء، المغرب' : isFr ? 'Adresse : Casablanca, Maroc' : 'Address: Casablanca, Morocco',
      isAr ? 'الموقع الإلكتروني: www.jmlamaroc.com' : isFr ? 'Site Web : www.jmlamaroc.com' : 'Website: www.jmlamaroc.com'
    ],

    sec2Title: isAr ? '2. البيانات الشخصية التي نجمعها' : isFr ? '2. Données personnelles collectées' : '2. Personal Data We Collect',
    sec2Desc: isAr 
      ? 'نقوم بجمع البيانات التالية عند استخدامكم لمنصتنا:' 
      : isFr 
      ? 'Nous collectons les données suivantes lors de votre utilisation de notre plateforme :' 
      : 'We collect the following data when you use our platform:',
    
    sec2_1Title: isAr ? '2.1 بيانات التسجيل' : isFr ? "2.1 Données d'inscription" : '2.1 Registration Data',
    sec2_1List: isAr
      ? ['الاسم الكامل', 'عنوان البريد الإلكتروني', 'رقم الهاتف (عند الدفع أو تفعيل الحساب)', 'كلمة المرور (مشفرة)']
      : isFr
      ? ['Nom complet', 'Adresse e-mail', 'Numéro de téléphone (lors du paiement ou de l\'activation du compte)', 'Mot de passe (chiffré)']
      : ['Full name', 'Email address', 'Phone number (during payment or account activation)', 'Password (encrypted)'],
    
    sec2_2Title: isAr ? '2.2 بيانات الاستخدام' : isFr ? "2.2 Données d'utilisation" : '2.2 Usage Data',
    sec2_2List: isAr
      ? ['عمليات البحث المُجراة (نصية وبالصور)', 'تاريخ ووقت الولوج للمنصة', 'نوع الجهاز والمتصفح المستخدم']
      : isFr
      ? ['Recherches effectuées (texte et images)', 'Date et heure d\'accès à la plateforme', 'Type d\'appareil et navigateur utilisé']
      : ['Searches performed (text and image)', 'Date and time of access to the platform', 'Device type and browser used'],

    sec3Title: isAr ? '3. الأساس القانوني للمعالجة' : isFr ? '3. Base légale du traitement' : '3. Legal Basis for Processing',
    sec3Desc: isAr 
      ? 'وفقًا للقانون 09-08، نعتمد على الأسس القانونية التالية لمعالجة بياناتكم:' 
      : isFr 
      ? 'Conformément à la loi 09-08, nous nous appuyons sur les bases légales suivantes :' 
      : 'In accordance with Moroccan Law 09-08, we rely on the following legal bases:',
    sec3List: isAr
      ? [
          'الموافقة: عند إنشاء حسابكم، توافقون صراحةً على جمع ومعالجة بياناتكم.',
          'تنفيذ العقد: معالجة البيانات الضرورية لتقديم خدماتنا (البحث، الاشتراك، وعرض المتاجر).',
          'المصلحة المشروعة: تحسين خدماتنا وضمان أمن المنصة.'
        ]
      : isFr
      ? [
          'Consentement : En créant votre compte, vous consentez expressément à la collecte et au traitement de vos données.',
          'Exécution du contrat : Traitement nécessaire pour fournir nos services (recherche, abonnement et affichage des boutiques).',
          'Intérêt légitime : Améliorer nos services et assurer la sécurité de la plateforme.'
        ]
      : [
          'Consentement: By creating your account, you explicitly consent to the collection and processing of your data.',
          'Contract Performance: Processing necessary to provide our services (search, subscription, and store listing).',
          'Legitimate Interest: Improving our services and ensuring platform security.'
        ],

    sec4Title: isAr ? '4. أغراض معالجة البيانات' : isFr ? '4. Finalités du traitement des données' : '4. Purposes of Data Processing',
    sec4Desc: isAr 
      ? 'نستخدم بياناتكم الشخصية للأغراض التالية:' 
      : isFr 
      ? 'Nous utilisons vos données personnelles pour les finalités suivantes :' 
      : 'We use your personal data for the following purposes:',
    sec4List: isAr
      ? [
          'إنشاء وإدارة حسابكم على المنصة.',
          'تقديم خدمة البحث عن الموردين بالصورة والنص.',
          'إدارة الاشتراكات والتحقق من حسابات الموردين.',
          'إرسال إشعارات وتنبيهات تتعلق بحسابكم.',
          'تحسين جودة خدماتنا وتجربة المستخدم.'
        ]
      : isFr
      ? [
          'Création et gestion de votre compte sur la plateforme.',
          'Fourniture du service de recherche de fournisseurs par image et texte.',
          'Gestion des abonnements et vérification des comptes fournisseurs.',
          'Envoi de notifications et alertes relatives à votre compte.',
          'Amélioration de la qualité de nos services et de l\'expérience utilisateur.'
        ]
      : [
          'Creating and managing your account on the platform.',
          'Providing supplier search service via image and text.',
          'Managing subscriptions and verifying supplier accounts.',
          'Sending account-related notifications and alerts.',
          'Improving the quality of our services and user experience.'
        ],

    sec5Title: isAr ? '5. مشاركة البيانات' : isFr ? '5. Partage des données' : '5. Data Sharing',
    sec5Desc: isAr
      ? 'لا نبيع ولا نؤجر بياناتكم الشخصية لأي طرف ثالث. قد نشارك بياناتكم فقط مع مقدمي الخدمات التقنية الموثوقين (مثل خدمات الاستضافة وإرسال الرسائل) بموجب عقود تضمن حماية البيانات بالكامل.'
      : isFr
      ? "Nous ne vendons ni ne louons vos données personnelles à des tiers. Nous ne partageons vos données qu'avec des prestataires techniques de confiance (tels que l'hébergement et les services d'envoi de messages) sous contrat garantissant la pleine sécurité des données."
      : 'We do not sell or rent your personal data to any third party. We only share your data with trusted technical service providers (such as hosting and messaging services) under contracts that guarantee full data protection.',

    sec6Title: isAr ? '6. مدة الاحتفاظ بالبيانات' : isFr ? '6. Durée de conservation des données' : '6. Data Retention Period',
    sec6List: isAr
      ? [
          'بيانات الحساب: طوال مدة بقاء الحساب نشطًا، وحتى 12 شهرًا بعد الإلغاء.',
          'بيانات الاستخدام: 24 شهرًا من تاريخ الجمع.'
        ]
      : isFr
      ? [
          'Données du compte : Pendant toute la durée d\'activité du compte, et jusqu\'à 12 mois après sa suppression.',
          'Données d\'utilisation : 24 mois à compter de la date de collecte.'
        ]
      : [
          'Account Data: Throughout the duration the account is active, and up to 12 months after cancellation.',
          'Usage Data: 24 months from the collection date.'
        ],

    sec7Title: isAr ? '7. حقوقكم (القانون 09-08)' : isFr ? '7. Vos droits (Loi 09-08)' : '7. Your Rights (Moroccan Law 09-08)',
    sec7Desc: isAr 
      ? 'بموجب القانون المغربي 09-08، تتمتعون بالحقوق التالية:' 
      : isFr 
      ? 'Conformément à la loi marocaine 09-08, vous disposez des droits suivants :' 
      : 'Under Moroccan Law 09-08, you have the following rights:',
    sec7List: isAr
      ? [
          'حق الولوج: الاطلاع على بياناتكم الشخصية المحفوظة لدينا.',
          'حق التصحيح: طلب تعديل أو تحديث بياناتكم غير الدقيقة.',
          'حق الحذف: طلب حذف بياناتكم الشخصية.',
          'حق الاعتراض: الاعتراض على معالجة بياناتكم لأسباب مشروعة.'
        ]
      : isFr
      ? [
          'Droit d\'accès : Consulter vos données personnelles enregistrées chez nous.',
          'Droit de rectification : Demander la modification ou mise à jour de vos données inexactes.',
          'Droit de suppression : Demander la suppression de vos données personnelles.',
          'Droit d\'opposition : S\'opposer au traitement de vos données pour des motifs légitimes.'
        ]
      : [
          'Right of Access: Consult your personal data stored with us.',
          'Right to Rectification: Request correction or update of inaccurate data.',
          'Right to Erasure: Request deletion of your personal data.',
          'Right to Object: Object to processing of your data for legitimate reasons.'
        ],
    
    sec7Footer: isAr 
      ? 'لممارسة أي من هذه الحقوق، يمكنكم التواصل معنا مباشرة عبر البريد الإلكتروني: ' 
      : isFr 
      ? "Pour exercer l'un de ces droits, vous pouvez nous contacter directement par e-mail : " 
      : 'To exercise any of these rights, you can contact us directly at: '
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
              <Shield size={24} />
            </div>
            <div className={isAr ? 'text-right' : 'text-left'}>
              <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
              <p className="text-sm text-gray-500 mt-1">JML Maroc | jmlamaroc.com</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`space-y-6 text-gray-700 leading-relaxed text-sm ${isAr ? 'text-right' : 'text-left'}`}>
          <p className="font-semibold text-base text-gray-900">{content.subTitle}</p>
          <p>{content.desc}</p>

          <h2 className="text-lg font-bold text-gray-900 pt-4">{content.sec1Title}</h2>
          <p>{content.sec1Desc}</p>
          <ul className={`list-disc list-inside space-y-1 ${isAr ? 'pr-4' : 'pl-4'}`}>
            {content.sec1List.map((item, idx) => <li key={idx}>{item}</li>)}
            <li>
              {isAr ? 'البريد الإلكتروني: ' : isFr ? 'E-mail : ' : 'Email: '}
              <strong>{siteEmail}</strong>
            </li>
          </ul>

          <h2 className="text-lg font-bold text-gray-900 pt-4">{content.sec2Title}</h2>
          <p>{content.sec2Desc}</p>
          
          <h3 className="font-bold text-gray-900 mt-2">{content.sec2_1Title}</h3>
          <ul className={`list-disc list-inside space-y-1 ${isAr ? 'pr-4' : 'pl-4'}`}>
            {content.sec2_1List.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>

          <h3 className="font-bold text-gray-900 mt-2">{content.sec2_2Title}</h3>
          <ul className={`list-disc list-inside space-y-1 ${isAr ? 'pr-4' : 'pl-4'}`}>
            {content.sec2_2List.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>

          <h2 className="text-lg font-bold text-gray-900 pt-4">{content.sec3Title}</h2>
          <p>{content.sec3Desc}</p>
          <ul className={`list-disc list-inside space-y-1 ${isAr ? 'pr-4' : 'pl-4'}`}>
            {content.sec3List.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>

          <h2 className="text-lg font-bold text-gray-900 pt-4">{content.sec4Title}</h2>
          <p>{content.sec4Desc}</p>
          <ul className={`list-disc list-inside space-y-1 ${isAr ? 'pr-4' : 'pl-4'}`}>
            {content.sec4List.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>

          <h2 className="text-lg font-bold text-gray-900 pt-4">{content.sec5Title}</h2>
          <p>{content.sec5Desc}</p>

          <h2 className="text-lg font-bold text-gray-900 pt-4">{content.sec6Title}</h2>
          <ul className={`list-disc list-inside space-y-1 ${isAr ? 'pr-4' : 'pl-4'}`}>
            {content.sec6List.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>

          <h2 className="text-lg font-bold text-gray-900 pt-4">{content.sec7Title}</h2>
          <p>{content.sec7Desc}</p>
          <ul className={`list-disc list-inside space-y-2 ${isAr ? 'pr-4' : 'pl-4'}`}>
            {content.sec7List.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
          <p className="mt-3">
            {content.sec7Footer}
            <strong>{siteEmail}</strong>
            {isAr ? ' أو على الرقم ' : isFr ? ' ou au numéro ' : ' or at the number '}
            <strong>{sitePhone}</strong>.
          </p>
        </div>

      </div>
    </div>
  );
}
