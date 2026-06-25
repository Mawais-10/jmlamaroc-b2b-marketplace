import { useState, useEffect } from 'react';
import { Search, Package, Trash2 } from 'lucide-react';
import { apiAdminGetProducts, apiAdminDeleteProduct, ApiProduct } from '../../services/api';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await apiAdminGetProducts(search ? { search } : undefined);
      setProducts(res.products);
      setTotal(res.total);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(loadProducts, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async (product: ApiProduct) => {
    if (!confirm(`Delete product "${product.description || product.title}"?`)) return;
    setActionLoading(product._id);
    try {
      await apiAdminDeleteProduct(product._id);
      setProducts(prev => prev.filter(p => p._id !== product._id));
      toast.success('Product deleted');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Manage Products</h1>
          <p className="text-sm text-[#888888]">{total} total products</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-[#CCCCCC] rounded-xl px-4 py-2.5 mb-5 focus-within:border-[#E85D04] transition-colors">
        <Search size={16} className="text-[#888888]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="flex-1 outline-none text-sm placeholder:text-[#888888] bg-transparent"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-[#E85D04] border-t-transparent rounded-full" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-[#CCCCCC]">
          <Package size={48} className="mx-auto mb-4 text-[#CCCCCC]" />
          <p className="font-semibold text-[#444444]">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map(product => (
            <div key={product._id} className={`bg-white rounded-xl border border-[#CCCCCC] overflow-hidden ${!product.isActive ? 'opacity-60' : ''}`}>
              <div className="relative aspect-square">
                <img src={product.imageUrl} alt={product.description} className="w-full h-full object-cover" />
                {!product.isActive && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="text-white text-xs bg-black/50 px-2 py-0.5 rounded">Hidden</span>
                  </div>
                )}
                <button
                  onClick={() => handleDelete(product)}
                  disabled={actionLoading === product._id}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="p-3">
                <p className="text-xs text-[#888888] truncate">{product.storeName}</p>
                <p className="text-sm font-medium text-[#1A1A1A] truncate">{product.description || product.title || '—'}</p>
                <p className="text-xs text-[#888888]">{product.category}</p>
                {product.price ? (
                  <p className="text-sm font-bold mt-1" style={{ color: '#E85D04' }}>{product.price} {product.currency}</p>
                ) : (
                  <p className="text-xs text-[#888888] mt-1">Price on request</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
