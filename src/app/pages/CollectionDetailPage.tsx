import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Layers, Loader2, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiGetProducts, ApiProduct } from '../services/api';

export default function CollectionDetailPage() {
  const { id } = useParams();
  const { user, favorites, collections } = useApp();
  const navigate = useNavigate();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const isFavCollection = id === 'favorites';
  const collection = isFavCollection 
    ? { id: 'favorites', name: 'My Favorites', description: 'Products you have marked with a heart', color: '#CC0000', items: favorites || [] }
    : collections.find(c => c.id === id);

  useEffect(() => {
    if (!user) navigate('/login?redirect=/collections');
  }, [user]);

  useEffect(() => {
    if (!collection || collection.items.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    apiGetProducts({ ids: collection.items.join(','), limit: '100' })
      .then(res => setProducts(res.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, collection?.items.length]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <Loader2 size={32} className="animate-spin" style={{ color: '#1A7A5E' }} />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-center">
          <p className="text-xl font-semibold text-[#444444]">Collection not found</p>
          <button onClick={() => navigate('/collections')} className="mt-4 text-sm font-medium hover:opacity-80" style={{ color: '#1A7A5E' }}>
            ← Back to collections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#CCCCCC] px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate('/collections')} className="flex items-center gap-1.5 text-sm text-[#888888] hover:text-[#1A7A5E] transition-colors mb-3">
            <ArrowLeft size={15} /> Back to Collections
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: collection.color + '20' }}>
              <Layers size={22} style={{ color: collection.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">{collection.name}</h1>
              <p className="text-sm text-[#888888]">
                {collection.description || `${collection.items.length} items`}
              </p>
            </div>
          </div>
          <div className="mt-3 h-1 w-32 rounded-full" style={{ backgroundColor: collection.color }} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#E8F5F0' }}>
              <ImageIcon size={48} className="text-[#CCCCCC]" />
            </div>
            <h2 className="text-xl font-semibold text-[#444444] mb-2">{isFavCollection ? 'No favorites yet' : 'This collection is empty'}</h2>
            <p className="text-sm text-[#888888] mb-8">
              {isFavCollection ? 'Mark products with a heart to see them here.' : 'Browse products and add them to this collection.'}
            </p>
            <button onClick={() => navigate('/search')} className="px-6 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: '#1A7A5E' }}>
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <div key={product._id} className="bg-white rounded-xl overflow-hidden border border-[#CCCCCC] hover:shadow-lg hover:border-[#1A7A5E] transition-all">
                <div className="relative aspect-square">
                  <img src={product.imageUrl} alt={product.description} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="text-xs text-[#888888] mb-1">
                    {new Date(product.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <button
                    onClick={() => navigate(`/groups/${product.storeHandle}`)}
                    className="text-sm font-semibold text-[#1A1A1A] hover:text-[#1A7A5E] truncate block w-full text-left"
                  >
                    {product.storeName}
                  </button>
                  <p className="text-xs text-[#888888] truncate mt-0.5">{product.description}</p>
                  {product.price
                    ? <p className="text-sm font-bold mt-1" style={{ color: '#1A7A5E' }}>{product.price} {product.currency}</p>
                    : <p className="text-xs text-[#888888] mt-1">Price not listed</p>
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
