import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Image as ImageIcon, Users, Send, MessageCircle, Heart, MapPin, Loader2 } from 'lucide-react';
import { apiGetStore, ApiStore, ApiProduct } from '../services/api';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export default function StoreDetailPage() {
  const { storeHandle } = useParams();
  const navigate = useNavigate();
  const { user, isFavorite, addFavorite, removeFavorite } = useApp();

  const [store, setStore] = useState<ApiStore | null>(null);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeHandle) return;
    setLoading(true);
    apiGetStore(storeHandle)
      .then(res => {
        setStore(res.store);
        setProducts(res.products);
      })
      .catch(err => {
        toast.error('Could not load store details');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [storeHandle]);

  const handleFavorite = (productId: string) => {
    if (!user) { navigate('/login?redirect=/search'); return; }
    if (isFavorite(productId)) { removeFavorite(productId); toast.success('Removed from favorites'); }
    else { addFavorite(productId); toast.success('Added to favorites!'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <Loader2 size={32} className="animate-spin" style={{ color: '#1A7A5E' }} />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-center">
          <p className="text-xl font-semibold text-[#444444]">Store not found</p>
          <button onClick={() => navigate('/groups')} className="mt-4 text-sm font-medium hover:opacity-80" style={{ color: '#1A7A5E' }}>
            ← Back to stores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Store header */}
      <div className="bg-white border-b border-[#CCCCCC]">
        {/* Cover */}
        <div className="relative h-48 grid grid-cols-4 overflow-hidden">
          {store.coverImages.slice(0, 4).length > 0 ? (
            store.coverImages.slice(0, 4).map((img, i) => (
              <img key={i} src={img.url} alt="" className="w-full h-full object-cover" />
            ))
          ) : (
            <div className="col-span-4 bg-[#E8F5F0] flex items-center justify-center opacity-30">
              <ImageIcon size={64} style={{ color: '#1A7A5E' }} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <button
            onClick={() => navigate('/groups')}
            className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 text-sm font-medium text-[#444444] hover:bg-white transition-colors shadow"
          >
            <ArrowLeft size={15} /> Back
          </button>
        </div>

        {/* Store info */}
        <div className="px-6 py-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {store.avatar ? (
                <img
                  src={store.avatar}
                  alt={store.name}
                  className="w-16 h-16 rounded-xl -mt-10 border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div
                  style={{ backgroundColor: '#1A7A5E' }}
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-bold -mt-10 border-4 border-white shadow-lg"
                >
                  {store.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-[#1A1A1A]">{store.name}</h1>
                <p className="text-sm text-[#888888]">@{store.handle}</p>
                {store.description && <p className="text-sm text-[#444444] mt-1 max-w-lg">{store.description}</p>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {store.telegramLink && (
                <a href={store.telegramLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#229ED9' }}>
                  <Send size={15} /> Telegram
                </a>
              )}
              {store.whatsappLink && (
                <a href={store.whatsappLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#25D366' }}>
                  <MessageCircle size={15} /> WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[#CCCCCC] flex-wrap">
            <div className="flex items-center gap-1.5 text-sm text-[#888888]">
              <ImageIcon size={15} style={{ color: '#1A7A5E' }} />
              <span>{store.productCount.toLocaleString()} products</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-[#888888]">
              <Users size={15} style={{ color: '#1A7A5E' }} />
              <span>{store.followerCount.toLocaleString()} followers</span>
            </div>
            {store.city && (
              <div className="flex items-center gap-1.5 text-sm text-[#888888]">
                <MapPin size={15} style={{ color: '#1A7A5E' }} />
                <span>{store.city}, Morocco</span>
              </div>
            )}
            {store.categories?.map(cat => (
              <span key={cat} className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: '#E8F5F0', color: '#1A7A5E' }}>
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-5">Products from {store.name}</h2>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-[#CCCCCC]">
            <ImageIcon size={48} className="mx-auto mb-4 text-[#CCCCCC]" />
            <p className="text-lg font-semibold text-[#444444]">No products listed yet</p>
            <p className="text-sm text-[#888888]">Contact this store directly via Telegram or WhatsApp</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <div key={product._id} className="bg-white rounded-xl overflow-hidden border border-[#CCCCCC] hover:shadow-lg hover:border-[#1A7A5E] transition-all">
                <div className="relative aspect-square">
                  <img src={product.imageUrl} alt={product.description} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleFavorite(product._id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-md hover:scale-110 transition-transform"
                  >
                    <Heart size={16} fill={isFavorite(product._id) ? '#CC0000' : 'none'} stroke={isFavorite(product._id) ? '#CC0000' : '#888888'} />
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-xs text-[#888888] mb-1">{new Date(product.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  <p className="text-sm font-medium text-[#1A1A1A] truncate">{product.description}</p>
                  <span className="text-xs text-[#888888]">{product.subcategory}</span>
                  {product.price ? (
                    <p className="text-sm font-bold mt-1" style={{ color: '#1A7A5E' }}>{product.price} {product.currency}</p>
                  ) : (
                    <p className="text-xs text-[#888888] mt-1">Price not listed</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-8 p-6 rounded-2xl text-white text-center" style={{ backgroundColor: '#1E3A30' }}>
          <p className="text-lg font-semibold mb-2">Interested in ordering from {store.name}?</p>
          <p className="text-sm opacity-70 mb-5">Contact them directly for pricing, MOQ, and availability</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {store.telegramLink && (
              <a href={store.telegramLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#229ED9' }}>
                <Send size={15} /> Contact on Telegram
              </a>
            )}
            {store.whatsappLink && (
              <a href={store.whatsappLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#25D366' }}>
                <MessageCircle size={15} /> Contact on WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
