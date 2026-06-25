import { useNavigate } from 'react-router';
import { Shield, Zap, Users, Package, Heart, MessageCircle, Search, Globe } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { useApp } from '../context/AppContext';

export default function AboutPage() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { sitePhone, siteWhatsapp } = useApp();

  const becomeSupplierUrl = `https://api.whatsapp.com/send?phone=${siteWhatsapp}&text=${encodeURIComponent('مرحباً، أريد إضافة متجر الجملة الخاص بي في منصة jmlamaroc.com.\n\nاسم المتجر: \nقناة التيليجرام: \nالمدينة: \nالفئة: ')}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="py-20 px-4 text-center" style={{ backgroundColor: '#3E1A0A' }}>
        <div className="inline-flex items-center gap-2 mb-6">
          <div style={{ backgroundColor: '#E85D04' }} className="w-12 h-12 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          {language === 'ar' ? 'حول JML Maroc' : language === 'fr' ? 'À propos de JML Maroc' : 'About JML Maroc'}
        </h1>
        <p className="text-xl text-[#FFF2EB] opacity-80 max-w-2xl mx-auto">
          {language === 'ar' ? 'أكبر سوق للجملة في المغرب يربط تجار التجزئة بالموردين عبر اكتشاف المنتجات بالذكاء الاصطناعي.' : language === 'fr' ? 'La plus grande place de marché de gros du Maroc, connectant les détaillants avec les fournisseurs grâce à la découverte de produits par IA.' : "Morocco's largest wholesale marketplace, connecting retailers with suppliers through AI-powered product discovery."}
        </p>
      </div>

      {/* Mission */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
              {language === 'ar' ? 'مهمتنا' : language === 'fr' ? 'Notre Mission' : 'Our Mission'}
            </h2>
            <p className="text-[#444444] leading-relaxed mb-4">
              {language === 'ar' ? 'تم بناء JML Maroc لحل مشكلة حقيقية لتجار التجزئة في المغرب: إيجاد موردي الجملة أمر يستغرق وقتاً طويلاً وغير فعّال.' : language === 'fr' ? 'JML Maroc a été créé pour résoudre un problème réel pour les détaillants marocains : trouver des grossistes est chronophage, inefficace et repose sur des relations personnelles.' : 'JML Maroc was built to solve a real problem for Moroccan retailers: finding wholesale suppliers is time-consuming, inefficient, and relies on personal connections.'}
            </p>
            <p className="text-[#444444] leading-relaxed">
              {language === 'ar' ? 'بنينا منصة مدعومة بالذكاء الاصطناعي تتيح لأي تاجر تجزئة التقاط صورة منتج واكتشاف كل تاجر جملة يبيعه فوراً.' : language === 'fr' ? "Nous avons construit une plateforme IA qui permet à tout détaillant de prendre une photo d'un produit et de trouver instantanément chaque grossiste qui le vend." : 'We built an AI-powered platform that lets any retailer take a photo of a product and instantly find every wholesaler selling it — with prices, product counts, and direct contact links.'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '1M+', label: language === 'ar' ? 'منتجات مفهرسة' : language === 'fr' ? 'Produits Indexés' : 'Products Indexed', icon: Package },
              { value: '163', label: language === 'ar' ? 'متجر موثق' : language === 'fr' ? 'Boutiques Vérifiées' : 'Verified Stores', icon: Users },
              { value: '<1s', label: language === 'ar' ? 'سرعة البحث' : language === 'fr' ? 'Vitesse de Recherche' : 'Search Speed', icon: Zap },
              { value: '100%', label: language === 'ar' ? 'مجاني الاستخدام' : language === 'fr' ? 'Utilisation Gratuite' : 'Free to Use', icon: Heart },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="p-5 rounded-2xl border border-[#CCCCCC] text-center">
                <Icon size={24} className="mx-auto mb-3" style={{ color: '#E85D04' }} />
                <p className="text-2xl font-bold" style={{ color: '#E85D04' }}>{value}</p>
                <p className="text-sm text-[#888888] mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1A1A1A] text-center mb-12">
            {language === 'ar' ? 'لماذا يختار تجار التجزئة JML Maroc' : language === 'fr' ? 'Pourquoi les détaillants choisissent JML Maroc' : 'Why Retailers Choose JML Maroc'}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: language === 'ar' ? 'بحث بالصورة بالذكاء الاصطناعي' : language === 'fr' ? 'Recherche par Image IA' : 'AI Image Search',
                desc: language === 'ar' ? 'ارفع أي صورة منتج واعثر على جميع تجار الجملة في أقل من ثانية.' : language === 'fr' ? "Téléchargez n'importe quelle photo de produit et trouvez tous les grossistes correspondants en moins d'1 seconde grâce à l'IA." : 'Upload any product photo and find all matching wholesalers in under 1 second using advanced AI vision technology.'
              },
              {
                icon: MessageCircle,
                title: language === 'ar' ? 'اتصال مباشر بالمورد' : language === 'fr' ? 'Contact Direct avec le Fournisseur' : 'Direct Supplier Contact',
                desc: language === 'ar' ? 'تواصل مباشرة مع تجار الجملة عبر واتسآب وتيليغرام.' : language === 'fr' ? 'Contactez directement les grossistes via WhatsApp et Telegram. Pas d\'intermédiaires, pas de commissions.' : 'Connect directly with wholesalers via WhatsApp and Telegram. No middlemen, no commission fees.'
              },
              {
                icon: Globe,
                title: language === 'ar' ? 'المغرب وما بعده' : language === 'fr' ? 'Maroc & Au-delà' : 'Morocco & Beyond',
                desc: language === 'ar' ? 'أكثر من 163 متجر جملة موثق في المغرب مع خطط للتوسع.' : language === 'fr' ? '163+ boutiques de gros vérifiées à travers le Maroc, avec des projets d\'expansion vers l\'Afrique et les marchés arabes.' : '163+ verified wholesale stores across Morocco, with plans to expand to more African and Arab markets.'
              },
              {
                icon: Shield,
                title: language === 'ar' ? 'متاجر موثقة' : language === 'fr' ? 'Boutiques Vérifiées' : 'Verified Stores',
                desc: language === 'ar' ? 'كل متجر على JML Maroc تمت موافقته يدوياً من فريقنا لضمان الجودة والأصالة.' : language === 'fr' ? 'Chaque boutique sur JML Maroc est approuvée manuellement par notre équipe pour garantir la qualité.' : 'Every store on JML Maroc is manually approved by our team to ensure quality and authenticity.'
              },
              {
                icon: Heart,
                title: language === 'ar' ? 'حفظ وتنظيم' : language === 'fr' ? 'Enregistrer & Organiser' : 'Save & Organize',
                desc: language === 'ar' ? 'احفظ منتجاتك المفضلة ونظمها في مجموعات التوريد.' : language === 'fr' ? 'Enregistrez vos produits favoris et organisez-les en collections d\'approvisionnement pour votre entreprise.' : 'Save your favorite products and organize them into sourcing collections for your business.'
              },
              {
                icon: Zap,
                title: language === 'ar' ? 'تحديث مستمر' : language === 'fr' ? 'Toujours à Update' : 'Always Updated',
                desc: language === 'ar' ? 'يتم تحديث كتالوجنا يومياً بمنتجات جديدة.' : language === 'fr' ? 'Notre catalogue est mis à jour quotidiennement avec de nouveaux produits de tous les fournisseurs.' : 'Our catalog is updated daily with new products from all supplier stores across all categories.'
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-[#CCCCCC]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#FFF2EB' }}>
                  <Icon size={20} style={{ color: '#E85D04' }} />
                </div>
                <h3 className="font-bold text-[#1A1A1A] mb-2">{title}</h3>
                <p className="text-sm text-[#888888] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
            {language === 'ar' ? 'هل أنت مستعد للتوريد بطريقة أذكى?' : language === 'fr' ? 'Prêt à sourcer plus intelligemment ?' : 'Ready to start sourcing smarter?'}
          </h2>
          <p className="text-[#888888] mb-8">
            {language === 'ar' ? 'انضم إلى آلاف تجار التجزئة المغاربة الذين يستخدمون JML Maroc.' : language === 'fr' ? 'Rejoignez des milliers de détaillants marocains qui utilisent JML Maroc pour trouver les meilleures offres de gros.' : 'Join thousands of Moroccan retailers using JML Maroc to find the best wholesale deals.'}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button onClick={() => navigate('/register')} className="px-8 py-3.5 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: '#E85D04' }}>
              {language === 'ar' ? 'إنشاء حساب مجاني' : language === 'fr' ? 'Créer un compte gratuit' : 'Create Free Account'}
            </button>
            <a href={becomeSupplierUrl} target="_blank" rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity border border-[#E85D04]" style={{ color: '#E85D04' }}>
              {language === 'ar' ? 'أضف متجرك' : language === 'fr' ? 'Référencer votre boutique' : 'List Your Store'}
            </a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 px-4 border-t border-[#CCCCCC]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-[#888888] mb-2">
            {language === 'ar' ? 'أسئلة أو ملاحظات؟ يسعدنا سماعك عبر واتسآب.' : language === 'fr' ? 'Des questions ou des retours ? Écrivez-nous sur WhatsApp.' : "Questions or feedback? We'd love to hear from you on WhatsApp."}
          </p>
          <a href={`https://wa.me/${siteWhatsapp}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold hover:opacity-80 flex items-center justify-center gap-2" style={{ color: '#E85D04' }}>
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" className="inline-block"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            {sitePhone}
          </a>
        </div>
      </section>
    </div>
  );
}
