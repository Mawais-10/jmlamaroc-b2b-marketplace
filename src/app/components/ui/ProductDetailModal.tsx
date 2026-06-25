import { useState, useEffect } from 'react';
import { X, Maximize2, ChevronLeft, ChevronRight, Download, Send, Search } from 'lucide-react';
import { ApiProduct } from '../../services/api';
import { useTranslation } from '../../i18n/useTranslation';

interface ProductDetailModalProps {
  products: ApiProduct[];
  activeIndex: number;
  onClose: () => void;
  onSelectProduct: (index: number) => void;
  onVisualSearch: (product: ApiProduct) => void;
}

export default function ProductDetailModal({
  products,
  activeIndex,
  onClose,
  onSelectProduct,
  onVisualSearch,
}: ProductDetailModalProps) {
  const { language } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const product = products[activeIndex];

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!product) return null;

  const totalCount = products.length;
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  const dateStr = product.createdAt
    ? new Date(product.createdAt).toLocaleDateString(isAr ? 'ar-MA' : isFr ? 'fr-FR' : 'en-US', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      })
    : '25/04/2025';

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalCount <= 1) return;
    const nextIdx = (activeIndex - 1 + totalCount) % totalCount;
    onSelectProduct(nextIdx);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalCount <= 1) return;
    const nextIdx = (activeIndex + 1) % totalCount;
    onSelectProduct(nextIdx);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloading) return;
    setDownloading(true);
    try {
      const response = await fetch(product.imageUrl, { mode: 'cors' });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Use clean title or filename
      const filename = `${product.title || 'product'}-${product._id || 'image'}.jpg`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CORS download failed, falling back to new tab', err);
      // Fallback
      window.open(product.imageUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        // If Arabic, ArrowLeft goes to Next, ArrowRight goes to Prev
        if (isAr) {
          const nextIdx = (activeIndex + 1) % totalCount;
          onSelectProduct(nextIdx);
        } else {
          const prevIdx = (activeIndex - 1 + totalCount) % totalCount;
          onSelectProduct(prevIdx);
        }
      } else if (e.key === 'ArrowRight') {
        if (isAr) {
          const prevIdx = (activeIndex - 1 + totalCount) % totalCount;
          onSelectProduct(prevIdx);
        } else {
          const nextIdx = (activeIndex + 1) % totalCount;
          onSelectProduct(nextIdx);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, totalCount, isAr, onClose, onSelectProduct]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl overflow-hidden shadow-2xl w-full flex flex-col relative transition-all duration-300 transform scale-100 ${
          isFullscreen ? 'max-w-2xl' : 'max-w-md'
        }`}
        onClick={(e) => e.stopPropagation()}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* UPPER PART: Image Slider */}
        <div className="relative w-full aspect-[4/3] bg-[#1A1A1A] flex items-center justify-center select-none group">
          <img
            src={product.imageUrl}
            alt={product.title || product.description}
            className="w-full h-full object-contain"
          />

          {/* Watermark in the center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
            <span className="text-white text-2xl font-black tracking-widest uppercase select-none">
              JMLMAROC.COM
            </span>
          </div>

          {/* Slide counter (top-left) */}
          <div className="absolute top-4 left-4 bg-black/55 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center">
            {activeIndex + 1} / {totalCount}
          </div>

          {/* Action buttons (top-right) */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(!isFullscreen);
              }}
              className="w-9 h-9 rounded-full bg-black/55 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/75 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/55 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/75 transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Slider navigation chevrons */}
          {totalCount > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/75 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/75 transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        {/* MIDDLE PART: Store / Price metadata row */}
        <div className="p-5 border-b border-gray-100 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            
            {/* Price section (left/RTL-right side) */}
            <div className="flex items-center">
              <div 
                className="px-4 py-2 rounded-2xl flex items-center gap-1.5 font-bold"
                style={{ backgroundColor: '#EBF7F5', color: '#1B5B49' }}
              >
                <span className="text-xs font-semibold">MAD</span>
                <span className="text-lg">{product.price || '70'}</span>
              </div>
            </div>

            {/* Store and details section */}
            <div className="flex-1 flex items-start gap-3 min-w-0">
              <div className="flex-1 min-w-0">
                {/* Store title & date row */}
                <div className={`flex items-center justify-between gap-2 mb-1 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                  <h3 className="font-bold text-base text-[#1A1A1A] truncate hover:text-[#E85D04] cursor-pointer">
                    {product.storeName || (isAr ? 'متجر الرائد للبيع بالجملة' : 'Al Raed Wholesale Store')}
                  </h3>
                  <span className="text-[11px] text-gray-400 shrink-0 font-medium">{dateStr}</span>
                </div>

                {/* Description */}
                <p className={`text-sm text-gray-600 leading-relaxed font-medium ${isAr ? 'text-right' : 'text-left'}`}>
                  {product.description || product.title}
                </p>
              </div>

              {/* Store Avatar */}
              <div className="w-11 h-11 rounded-full bg-[#FFF2EB] border border-[#FFE4D6] flex items-center justify-center text-[#E85D04] text-sm font-bold shrink-0 overflow-hidden shadow-sm">
                {product.storeAvatar ? (
                  <img src={product.storeAvatar} alt="store avatar" className="w-full h-full object-cover" />
                ) : (
                  (product.storeName || 'S').charAt(0).toUpperCase()
                )}
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM PART: Footer Actions */}
        <div className="px-5 py-4 bg-gray-50 flex items-center justify-between gap-3 border-t border-gray-100">
          
          {/* Download button */}
          <button
            onClick={handleDownload}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-[#3E1A0A] bg-[#F7F5F0] hover:bg-[#EFECE6] border border-[#E5E2D9] transition-all flex items-center justify-center gap-2"
          >
            <Download size={16} />
            <span>
              {downloading 
                ? (isAr ? 'جاري التحميل...' : isFr ? 'Téléchargement...' : 'Downloading...') 
                : (isAr ? 'تحميل' : isFr ? 'Télécharger' : 'Download')}
            </span>
          </button>

          {/* Telegram / Primary contact button */}
          <a
            href={`https://t.me/${product.storeHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#2ea9e8] hover:bg-[#209ada] shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Send size={16} className="-rotate-45 relative -top-0.5" />
            <span>{isAr ? 'تيليجرام' : isFr ? 'Telegram' : 'Telegram'}</span>
          </a>

          {/* Search similar button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVisualSearch(product);
            }}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-[#3E1A0A] bg-[#F7F5F0] hover:bg-[#EFECE6] border border-[#E5E2D9] transition-all flex items-center justify-center gap-2"
          >
            <Search size={16} />
            <span>{isAr ? 'البحث عن شبيه' : isFr ? 'Recherche similaire' : 'Search similar'}</span>
          </button>

        </div>
      </div>
    </div>
  );
}
