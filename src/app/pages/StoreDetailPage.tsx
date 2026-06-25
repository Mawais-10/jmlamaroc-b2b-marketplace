import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  ArrowLeft, Image as ImageIcon, Users, Send, MessageCircle, 
  Heart, Loader2, Search, MoreVertical, Clock
} from 'lucide-react';
import { apiGetStore, ApiStore, ApiProduct } from '../services/api';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { useTranslation } from '../i18n/useTranslation';
import ProductDetailModal from '../components/ui/ProductDetailModal';

// ─── Product Card (same style as SearchPage) ──────────────────────────────────
function ProductCard({
  product,
  isFav,
  onFavorite,
  onVisualSearch,
  onClick,
}: {
  product: ApiProduct;
  isFav: boolean;
  onFavorite: () => void;
  onVisualSearch: () => void;
  onClick: () => void;
}) {
  const { t, language } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const dateStr = product.createdAt
    ? new Date(product.createdAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : '';

  const avatarLetter = product.storeName?.charAt(0)?.toUpperCase() || 'S';

  return (
    <div className="bg-white border border-[#E8E8E8] rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Image */}
      <div
        onClick={onClick}
        className="relative w-full aspect-square overflow-hidden bg-gray-100 cursor-pointer group"
      >
        <img
          src={product.imageUrl}
          alt={product.title || product.description}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* COD + 24h banner */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center h-8 overflow-hidden">
          <div className="bg-[#FF6B00] text-white text-[11px] font-black px-2 h-full flex items-center">
            COD
          </div>
          <div className="bg-[#1DB954] text-white text-[11px] font-bold flex-1 h-full flex items-center px-2 gap-1">
            <span>
              {language === 'ar' ? 'شحن خلال ' : language === 'fr' ? 'Expédié sous ' : 'Ship within '}
              <strong>{language === 'ar' ? '24 ساعة' : language === 'fr' ? '24 heures' : '24 hours'}</strong>
            </span>
            <svg className="ml-auto" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="white" opacity="0.25"/>
              <polygon points="9,7 17,12 9,17" fill="white"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="px-3 pt-2 pb-0">
        <p className="text-[11px] text-[#888] mb-1.5">{dateStr}</p>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-full bg-[#E85D04] flex items-center justify-center text-white text-[10px] font-bold shrink-0 overflow-hidden">
              {avatarLetter}
            </div>
            <span className="text-[12px] font-semibold text-[#333] truncate max-w-[120px]">
              {product.storeName}
            </span>
          </div>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <MoreVertical size={14} className="text-[#888]" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-7 bg-white border border-[#E8E8E8] rounded-lg shadow-lg z-50 py-1 min-w-[130px]">
                <button
                  onClick={(e) => { e.stopPropagation(); onFavorite(); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-[#333] hover:bg-gray-50"
                >
                  {isFav ? (language === 'ar' ? 'إزالة من المفضلة' : language === 'fr' ? 'Retirer des favoris' : 'Remove favorite') : (language === 'ar' ? 'حفظ في المفضلة' : language === 'fr' ? 'Ajouter aux favoris' : 'Save to favorites')}
                </button>
                <a
                  href={`https://t.me/${product.storeHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block text-left px-4 py-2 text-sm text-[#229ED9] hover:bg-gray-50"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
                >
                  {language === 'ar' ? 'افتح في تيليجرام' : language === 'fr' ? 'Ouvrir sur Telegram' : 'Open in Telegram'}
                </a>
              </div>
            )}
          </div>
        </div>
        <div onClick={onClick} className="cursor-pointer">
          <p className="text-[13px] font-semibold text-[#111] leading-snug line-clamp-2 mb-1">
            {product.title || product.description}
          </p>
          <p className="text-[12px] text-[#666] leading-snug line-clamp-2 mb-2">
            {product.description}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center border-t border-[#F0F0F0] mt-auto">
        <button
          onClick={(e) => { e.stopPropagation(); onFavorite(); }}
          className="flex-1 flex items-center justify-center py-2.5 hover:bg-[#FFF5F0] transition-colors border-r border-[#F0F0F0]"
        >
          <Heart size={17} fill={isFav ? '#EF4444' : 'none'} stroke={isFav ? '#EF4444' : '#999'} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onVisualSearch(); }}
          className="flex-1 flex items-center justify-center py-2.5 hover:bg-[#F5F5F5] transition-colors border-r border-[#F0F0F0]"
        >
          <Search size={17} className="text-[#555]" />
        </button>
        <a
          href={`https://t.me/${product.storeHandle}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center py-2.5 hover:bg-[#EAF6FD] transition-colors"
        >
          <Send size={17} className="text-[#229ED9]" />
        </a>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function StoreDetailPage() {
  const { storeHandle } = useParams();
  const navigate = useNavigate();
  const { user, isFavorite, addFavorite, removeFavorite } = useApp();
  const { t, language } = useTranslation();

  const [store, setStore] = useState<ApiStore | null>(null);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!storeHandle) return;
    setLoading(true);
    apiGetStore(storeHandle)
      .then(res => { setStore(res.store); setProducts(res.products); })
      .catch(() => toast.error('Could not load store details'))
      .finally(() => setLoading(false));
  }, [storeHandle]);

  const handleFavorite = (productId: string) => {
    if (!user) { navigate('/login?redirect=/search'); return; }
    if (isFavorite(productId)) { removeFavorite(productId); toast.success('Removed from favorites'); }
    else { addFavorite(productId); toast.success('Added to favorites!'); }
  };

  const handleVisualSearch = (imageUrl: string) => {
    navigate(`/search?img=${encodeURIComponent(imageUrl)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <Loader2 size={32} className="animate-spin text-[#E85D04]" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-center">
          <p className="text-xl font-semibold text-[#444]">
            {language === 'ar' ? 'المتجر غير موجود' : language === 'fr' ? 'Boutique introuvable' : 'Store not found'}
          </p>
          <button onClick={() => navigate('/groups')} className="mt-4 text-sm font-medium text-[#E85D04] hover:opacity-80">
            ← {t.store.backToStores}
          </button>
        </div>
      </div>
    );
  }

  const descShort = store.description?.slice(0, 160);
  const descLong = store.description;
  const hasMore = descLong && descLong.length > 160;

  // Format the last updated date
  const updatedDate = store.createdAt
    ? new Date(store.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Back button row */}
      <div className="bg-white border-b border-[#E8E8E8] px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/groups')}
            className="flex items-center gap-1.5 text-sm text-[#555] hover:text-[#E85D04] transition-colors"
          >
            <ArrowLeft size={16} />
            {t.store.backToStores}
          </button>
        </div>
      </div>

      {/* ── Store Profile Card (reference-image style) ── */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white border border-[#E8E8E8] rounded-xl px-5 py-5 flex items-start gap-4 relative">
          {/* Avatar */}
          <div className="shrink-0">
            {store.avatar ? (
              <img
                src={store.avatar}
                alt={store.name}
                className="w-16 h-16 rounded-xl object-cover border border-[#E8E8E8]"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[#E85D04] flex items-center justify-center text-white text-2xl font-bold">
                {store.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Name */}
            <h1 className="text-[18px] font-bold text-[#111] leading-tight mb-0.5">
              {store.name}
            </h1>
            {/* Handle */}
            <p className="text-[13px] text-[#888] mb-2">@{store.handle}</p>

            {/* Stats row */}
            <div className="flex items-center gap-4 flex-wrap mb-3">
              <div className="flex items-center gap-1.5 text-[13px] text-[#555]">
                <ImageIcon size={14} className="text-[#888]" />
                <span className="font-semibold text-[#333]">{store.productCount.toLocaleString()}</span>
                <span>{t.store.images}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-[#555]">
                <Users size={14} className="text-[#888]" />
                <span className="font-semibold text-[#333]">{store.followerCount.toLocaleString()}</span>
                <span>{t.store.subscribers}</span>
              </div>
              {updatedDate && (
                <div className="flex items-center gap-1.5 text-[13px] text-[#555]">
                  <Clock size={14} className="text-[#888]" />
                  <span>{t.store.updated} {updatedDate}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {store.description && (
              <div className="text-[13px] text-[#444] leading-relaxed">
                <p className="whitespace-pre-line">
                  {descExpanded ? descLong : descShort}
                  {!descExpanded && hasMore ? '...' : ''}
                </p>
                {hasMore && (
                  <button
                    onClick={() => setDescExpanded(v => !v)}
                    className="text-[#E85D04] font-medium text-[13px] mt-1 hover:underline"
                  >
                    {descExpanded ? t.store.showLess : t.store.showMore}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Telegram button (top right) */}
          <div className="shrink-0 flex flex-col gap-2 items-end">
            {store.telegramLink && (
              <a
                href={store.telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-[#229ED9] text-[#229ED9] rounded-lg text-sm font-semibold hover:bg-[#EAF6FD] transition-colors"
              >
                <Send size={15} />
                Telegram
              </a>
            )}
            {store.whatsappLink && (
              <a
                href={store.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-[#25D366] text-[#25D366] rounded-lg text-sm font-semibold hover:bg-[#F0FFF4] transition-colors"
              >
                <MessageCircle size={15} />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Products grid ── */}
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-[#333]">
            {products.length} {t.store.productsFrom} {store.name}
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-[#E8E8E8]">
            <ImageIcon size={48} className="mx-auto mb-4 text-[#CCC]" />
            <p className="text-lg font-semibold text-[#444]">{t.store.noProductsStore}</p>
            <p className="text-sm text-[#888] mt-1">{t.store.contactDirectly}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {products.map((product, idx) => (
              <ProductCard
                key={product._id}
                product={product}
                isFav={isFavorite(product._id)}
                onFavorite={() => handleFavorite(product._id)}
                onVisualSearch={() => handleVisualSearch(product.imageUrl)}
                onClick={() => setSelectedProductIndex(idx)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product detail modal */}
      {selectedProductIndex !== null && (
        <ProductDetailModal
          products={products}
          activeIndex={selectedProductIndex}
          onClose={() => setSelectedProductIndex(null)}
          onSelectProduct={(index) => setSelectedProductIndex(index)}
          onVisualSearch={(prod) => {
            setSelectedProductIndex(null);
            handleVisualSearch(prod.imageUrl);
          }}
        />
      )}
    </div>
  );
}
