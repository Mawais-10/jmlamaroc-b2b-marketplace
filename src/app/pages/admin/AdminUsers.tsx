import { useState, useEffect } from 'react';
import { Search, Users, UserX, Shield, Store, ShoppingBag } from 'lucide-react';
import { apiAdminGetUsers, apiAdminDeactivateUser, ApiUser } from '../../services/api';
import { toast } from 'sonner';

const ROLE_CONFIG = {
  admin: { label: 'Admin', color: '#CC0000', bg: '#FEF2F2', icon: Shield },
  supplier: { label: 'Supplier', color: '#E8820C', bg: '#FFF8E1', icon: Store },
  buyer: { label: 'Buyer', color: '#1A7A5E', bg: '#E8F5F0', icon: ShoppingBag },
};

export default function AdminUsers() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'buyer' | 'supplier' | 'admin'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (roleFilter !== 'all') params.role = roleFilter;
      const res = await apiAdminGetUsers(params);
      setUsers(res.users);
      setTotal(res.total);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(loadUsers, 300);
    return () => clearTimeout(t);
  }, [search, roleFilter]);

  const handleDeactivate = async (user: ApiUser) => {
    if (!confirm(`Deactivate user "${user.name}" (${user.email})? They will no longer be able to log in.`)) return;
    setActionLoading(user.id);
    try {
      await apiAdminDeactivateUser(user.id);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      toast.success('User deactivated');
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
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Manage Users</h1>
          <p className="text-sm text-[#888888]">{total} total active users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-[#CCCCCC] rounded-xl px-4 py-2.5 flex-1 min-w-48 focus-within:border-[#1A7A5E] transition-colors">
          <Search size={16} className="text-[#888888]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="flex-1 outline-none text-sm text-[#1A1A1A] placeholder:text-[#888888] bg-transparent"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'buyer', 'supplier', 'admin'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors capitalize ${
                roleFilter === r ? 'text-white' : 'bg-white border border-[#CCCCCC] text-[#888888] hover:border-[#1A7A5E]'
              }`}
              style={roleFilter === r ? { backgroundColor: '#1A7A5E' } : {}}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-[#1A7A5E] border-t-transparent rounded-full" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-[#CCCCCC]">
          <Users size={48} className="mx-auto mb-4 text-[#CCCCCC]" />
          <p className="font-semibold text-[#444444]">No users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#CCCCCC] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F9F9F9' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#888888] uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#888888] uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#888888] uppercase tracking-wider">Provider</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#888888] uppercase tracking-wider">Country</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#888888] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {users.map(user => {
                const roleConf = ROLE_CONFIG[user.role];
                return (
                  <tr key={user.id} className="hover:bg-[#F9F9F9] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div style={{ backgroundColor: '#1A7A5E' }} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {user.name?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">{user.name}</p>
                          <p className="text-xs text-[#888888]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium"
                        style={{ backgroundColor: roleConf.bg, color: roleConf.color }}
                      >
                        <roleConf.icon size={11} />
                        {roleConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[#888888] capitalize">{user.authProvider}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[#888888]">{user.country || '–'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleDeactivate(user)}
                          disabled={actionLoading === user.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 border border-red-200 hover:bg-red-50 transition-colors text-xs font-medium disabled:opacity-60"
                        >
                          <UserX size={13} /> Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
