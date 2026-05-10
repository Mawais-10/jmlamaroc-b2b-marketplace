import { useNavigate } from 'react-router';
import { Shield, Zap, Users, Package, Heart, MessageCircle, Search, Globe } from 'lucide-react';
import { WHATSAPP_BECOME_SUPPLIER_URL } from '../data/mockData';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="py-20 px-4 text-center" style={{ backgroundColor: '#1E3A30' }}>
        <div className="inline-flex items-center gap-2 mb-6">
          <div style={{ backgroundColor: '#1A7A5E' }} className="w-12 h-12 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">About ChouFliya</h1>
        <p className="text-xl text-[#E8F5F0] opacity-80 max-w-2xl mx-auto">
          Morocco's largest wholesale marketplace, connecting retailers with suppliers through AI-powered product discovery.
        </p>
      </div>

      {/* Mission */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Our Mission</h2>
            <p className="text-[#444444] leading-relaxed mb-4">
              ChouFliya was built to solve a real problem for Moroccan retailers: finding wholesale suppliers is time-consuming, inefficient, and relies on personal connections.
            </p>
            <p className="text-[#444444] leading-relaxed">
              We built an AI-powered platform that lets any retailer take a photo of a product and instantly find every wholesaler selling it — with prices, product counts, and direct contact links.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '1M+', label: 'Products Indexed', icon: Package },
              { value: '163', label: 'Verified Stores', icon: Users },
              { value: '<1s', label: 'Search Speed', icon: Zap },
              { value: '100%', label: 'Free to Use', icon: Heart },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="p-5 rounded-2xl border border-[#CCCCCC] text-center">
                <Icon size={24} className="mx-auto mb-3" style={{ color: '#1A7A5E' }} />
                <p className="text-2xl font-bold" style={{ color: '#1A7A5E' }}>{value}</p>
                <p className="text-sm text-[#888888] mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1A1A1A] text-center mb-12">Why Retailers Choose ChouFliya</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: 'AI Image Search',
                desc: 'Upload any product photo and find all matching wholesalers in under 1 second using advanced AI vision technology.'
              },
              {
                icon: MessageCircle,
                title: 'Direct Supplier Contact',
                desc: 'Connect directly with wholesalers via WhatsApp and Telegram. No middlemen, no commission fees.'
              },
              {
                icon: Globe,
                title: 'Morocco & Beyond',
                desc: '163+ verified wholesale stores across Morocco, with plans to expand to more African and Arab markets.'
              },
              {
                icon: Shield,
                title: 'Verified Stores',
                desc: 'Every store on ChouFliya is manually approved by our team to ensure quality and authenticity.'
              },
              {
                icon: Heart,
                title: 'Save & Organize',
                desc: 'Save your favorite products and organize them into sourcing collections for your business.'
              },
              {
                icon: Zap,
                title: 'Always Updated',
                desc: 'Our catalog is updated daily with new products from all supplier stores across all categories.'
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-[#CCCCCC]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#E8F5F0' }}>
                  <Icon size={20} style={{ color: '#1A7A5E' }} />
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
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Ready to start sourcing smarter?</h2>
          <p className="text-[#888888] mb-8">Join thousands of Moroccan retailers using ChouFliya to find the best wholesale deals.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button onClick={() => navigate('/register')} className="px-8 py-3.5 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: '#1A7A5E' }}>
              Create Free Account
            </button>
            <a href={WHATSAPP_BECOME_SUPPLIER_URL} target="_blank" rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity border border-[#1A7A5E]" style={{ color: '#1A7A5E' }}>
              List Your Store
            </a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 px-4 border-t border-[#CCCCCC]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-[#888888] mb-2">Questions or feedback? We'd love to hear from you.</p>
          <a href="mailto:hello@choufliya.ma" className="text-sm font-medium hover:opacity-80" style={{ color: '#1A7A5E' }}>
            hello@choufliya.ma
          </a>
        </div>
      </section>
    </div>
  );
}
