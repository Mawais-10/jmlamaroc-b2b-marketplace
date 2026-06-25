import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Heart, Search, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiGetProducts, ApiProduct } from '../services/api';
import { toast } from 'sonner';
import { useTranslation } from '../i18n/useTranslation';

export default function FavoritesPage() {
  const { user, favorites, removeFavorite } = useApp();
  const { t, language } = useTranslation();
  const navigate = useNavigate();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) navigate('/login?redirect=/favorites');
  }, [user]);

  useEffect(() => {
    if (!favorites || favorites.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    apiGetProducts({ ids: favorites.join(','), limit: '100' })
      .then(res => setProducts(res.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [favorites.length]);

  const handleRemove = (productId: string) => {
    removeFavorite(productId);
    toast.success(language === 'ar' ? 'تمت إزالته من المفضلة' : language === 'fr' ? 'Retiré des favoris' : 'Removed from favorites');
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <Loader2 size={32} className="animate-spin" style={{ color: '#E85D04' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#CCCCCC] px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: '#FFF2EB' }} className="p-2 rounded-xl">
              <Heart size={22} style={{ color: '#E85D04' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">{t.nav.favorites}</h1>
              <p className="text-sm text-[#888888]">
                {products.length > 0
                  ? language === 'ar'
                    ? `${products.length} منتج محفوظ`
                    : language === 'fr'
                      ? `${products.length} produit${products.length !== 1 ? 's' : ''} enregistré${products.length !== 1 ? 's' : ''}`
                      : `${products.length} product${products.length !== 1 ? 's' : ''} saved`
                  : language === 'ar' ? 'لا توجد مفضلة بعد' : language === 'fr' ? 'Pas encore de favoris' : 'No favorites yet'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {products.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#FFF2EB' }}>
              <Heart size={48} className="text-[#CCCCCC]" />
            </div>
            <h2 className="text-xl font-semibold text-[#444444] mb-2">
              {language === 'ar' ? 'ليس لديك أي مفضلة بعد' : language === 'fr' ? 'Vous n\'avez pas encore de favoris' : 'You don\'t have any favorites yet'}
            </h2>
            <p className="text-sm text-[#888888] mb-8">
              {language === 'ar' ? 'نتائج البحث التي تعجبك ستظهر هنا.' : language === 'fr' ? 'Les résultats de recherche que vous aimez apparaîtront ici.' : 'Search results you like will appear here.'}
            </p>
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#E85D04' }}
            >
              <Search size={18} />
              {language === 'ar' ? 'ابدأ البحث' : language === 'fr' ? 'Commencer à chercher' : 'Start Searching'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <div key={product._id} className="bg-white rounded-xl overflow-hidden border border-[#CCCCCC] hover:shadow-lg hover:border-[#E85D04] transition-all group">
                <div className="relative aspect-square">
                  <img src={product.imageUrl} alt={product.description} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-md hover:scale-110 transition-transform"
                    title="Remove from favorites"
                  >
                    <Heart size={16} fill="#CC0000" stroke="#CC0000" />
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-xs text-[#888888] mb-1">{new Date(product.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  <button
                    onClick={() => navigate(`/groups/${product.storeHandle}`)}
                    className="text-sm font-semibold text-[#1A1A1A] hover:text-[#E85D04] transition-colors truncate block w-full text-left"
                  >
                    {product.storeName}
                  </button>
                  <p className="text-xs text-[#888888] truncate">{product.description}</p>
                  {product.price ? (
                    <p className="text-sm font-bold mt-1" style={{ color: '#E85D04' }}>{product.price} {product.currency}</p>
                  ) : (
                    <p className="text-xs text-[#888888] mt-1">
                      {language === 'ar' ? 'السعر غير متاح' : language === 'fr' ? 'Prix non renseigné' : 'Price not listed'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
