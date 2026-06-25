import { useState, useEffect } from 'react';
import { Search, Store, Trash2, ToggleLeft, ToggleRight, ExternalLink, Package, Users } from 'lucide-react';
import { apiAdminGetStores, apiAdminToggleStore, apiAdminDeleteStore, ApiStore } from '../../services/api';
import { toast } from 'sonner';

export default function AdminStores() {
  const [stores, setStores] = useState<ApiStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const loadStores = async () => {
    setLoading(true);
    try {
      const res = await apiAdminGetStores(search ? { search } : undefined);
      setStores(res.stores);
      setTotal(res.total);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(loadStores, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleToggle = async (store: ApiStore) => {
    setActionLoading(store._id);
    try {
      const res = await apiAdminToggleStore(store._id);
      setStores(prev => prev.map(s => s._id === store._id ? res.store : s));
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (store: ApiStore) => {
    if (!confirm(`Delete store "${store.name}" and ALL its products? This cannot be undone.`)) return;
    setActionLoading(store._id);
    try {
      await apiAdminDeleteStore(store._id);
      setStores(prev => prev.filter(s => s._id !== store._id));
      toast.success('Store deleted');
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
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Manage Stores</h1>
          <p className="text-sm text-[#888888]">{total} total stores</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-[#CCCCCC] rounded-xl px-4 py-2.5 mb-5 focus-within:border-[#E85D04] transition-colors">
        <Search size={16} className="text-[#888888]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search stores by name or handle..."
          className="flex-1 outline-none text-sm text-[#1A1A1A] placeholder:text-[#888888] bg-transparent"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-[#E85D04] border-t-transparent rounded-full" />
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-[#CCCCCC]">
          <Store size={48} className="mx-auto mb-4 text-[#CCCCCC]" />
          <p className="font-semibold text-[#444444]">No stores found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stores.map(store => (
            <div key={store._id} className={`bg-white rounded-xl border overflow-hidden ${store.isApproved ? 'border-[#CCCCCC]' : 'border-red-200 opacity-75'}`}>
              <div className="flex items-center gap-4 p-4">
                {/* Avatar */}
                {store.avatar ? (
                  <img src={store.avatar} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div style={{ backgroundColor: '#E85D04' }} className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0">
                    {store.name.charAt(0)}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#1A1A1A] truncate">{store.name}</p>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                      style={{
                        backgroundColor: store.isApproved ? '#FFF2EB' : '#FEF2F2',
                        color: store.isApproved ? '#E85D04' : '#CC0000',
                      }}
                    >
                      {store.isApproved ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#888888] mt-0.5 flex-wrap">
                    <span>@{store.handle}</span>
                    <span className="flex items-center gap-1"><Package size={11} /> {store.productCount}</span>
                    <span className="flex items-center gap-1"><Users size={11} /> {store.followerCount}</span>
                    <span>{store.city}</span>
                    <span>{store.categories?.join(', ')}</span>
                    <span>Created {new Date(store.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`/groups/${store.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-[#CCCCCC] hover:border-[#E85D04] transition-colors"
                    title="View store"
                  >
                    <ExternalLink size={15} className="text-[#888888]" />
                  </a>
                  <button
                    onClick={() => handleToggle(store)}
                    disabled={actionLoading === store._id}
                    className={`p-2 rounded-lg border transition-colors disabled:opacity-60 ${store.isApproved ? 'border-[#CCCCCC] hover:border-red-400' : 'border-[#CCCCCC] hover:border-[#E85D04]'}`}
                    title={store.isApproved ? 'Pause store' : 'Activate store'}
                  >
                    {store.isApproved
                      ? <ToggleRight size={18} style={{ color: '#E85D04' }} />
                      : <ToggleLeft size={18} className="text-[#888888]" />
                    }
                  </button>
                  <button
                    onClick={() => handleDelete(store)}
                    disabled={actionLoading === store._id}
                    className="p-2 rounded-lg border border-[#CCCCCC] hover:border-red-400 transition-colors disabled:opacity-60"
                    title="Delete store"
                  >
                    <Trash2 size={15} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
