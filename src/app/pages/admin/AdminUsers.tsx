import { useState, useEffect } from 'react';
import { Search, Users, UserX, Shield, Store, ShoppingBag, CheckCircle, Ban, RefreshCw } from 'lucide-react';
import { 
  apiAdminGetUsers, 
  apiAdminDeactivateUser, 
  apiAdminApproveUser, 
  apiAdminBlockUser, 
  apiAdminUnblockUser, 
  ApiUser 
} from '../../services/api';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';

const ROLE_CONFIG = {
  admin: { label: 'Admin', color: '#CC0000', bg: '#FEF2F2', icon: Shield },
  supplier: { label: 'Supplier', color: '#E8820C', bg: '#FFF8E1', icon: Store },
  buyer: { label: 'Buyer', color: '#1A7A5E', bg: '#E8F5F0', icon: ShoppingBag },
};

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#E8820C', bg: '#FFF8E1', icon: RefreshCw },
  approved: { label: 'Approved', color: '#1A7A5E', bg: '#E8F5F0', icon: CheckCircle },
  blocked: { label: 'Blocked', color: '#CC0000', bg: '#FEF2F2', icon: Ban },
};

export default function AdminUsers() {
  const { user: currentUser } = useApp();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'buyer' | 'supplier' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'blocked'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
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
  }, [search, roleFilter, statusFilter]);

  const handleApprove = async (user: ApiUser) => {
    console.log('Approving user:', user.id);
    if (actionLoading) return;
    setActionLoading(user.id);
    try {
      const res = await apiAdminApproveUser(user.id);
      console.log('Approve result:', res);
      toast.success(`User "${user.name}" approved`);
      
      setUsers(prev => {
        if (statusFilter !== 'all' && statusFilter !== 'approved') {
          return prev.filter(u => u.id !== user.id);
        }
        return prev.map(u => u.id === user.id ? { ...u, status: 'approved' } : u);
      });
    } catch (err: any) {
      console.error('Approve error:', err);
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlock = async (user: ApiUser) => {
    console.log('Blocking user:', user.id);
    if (actionLoading) return;
    
    // Removed confirm() for direct action as requested by user's feedback
    setActionLoading(user.id);
    try {
      const res = await apiAdminBlockUser(user.id);
      console.log('Block result:', res);
      toast.success(`User "${user.name}" blocked`);
      
      setUsers(prev => {
        if (statusFilter !== 'all' && statusFilter !== 'blocked') {
          return prev.filter(u => u.id !== user.id);
        }
        return prev.map(u => u.id === user.id ? { ...u, status: 'blocked' } : u);
      });
    } catch (err: any) {
      console.error('Block error:', err);
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblock = async (user: ApiUser) => {
    console.log('Unblocking user:', user.id);
    if (actionLoading) return;
    setActionLoading(user.id);
    try {
      const res = await apiAdminUnblockUser(user.id);
      console.log('Unblock result:', res);
      toast.success(`User "${user.name}" unblocked`);
      
      setUsers(prev => {
        if (statusFilter !== 'all' && statusFilter !== 'approved') {
          return prev.filter(u => u.id !== user.id);
        }
        return prev.map(u => u.id === user.id ? { ...u, status: 'approved' } : u);
      });
    } catch (err: any) {
      console.error('Unblock error:', err);
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
          <p className="text-sm text-[#888888]">{total} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex gap-3 flex-wrap">
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

        {/* Status Tabs */}
        <div className="flex gap-2 border-b border-[#EEEEEE] pb-1">
          {(['all', 'pending', 'approved', 'blocked'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 text-sm font-medium transition-all relative capitalize ${
                statusFilter === s ? 'text-[#1A7A5E]' : 'text-[#888888] hover:text-[#444444]'
              }`}
            >
              {s}
              {statusFilter === s && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A7A5E] rounded-full" />
              )}
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
        <div className="bg-white rounded-xl border border-[#CCCCCC] overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F9F9F9' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#888888] uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#888888] uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#888888] uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#888888] uppercase tracking-wider">Provider</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#888888] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {users.map(user => {
                const roleConf = ROLE_CONFIG[user.role];
                const status = user.status || 'pending';
                const statusConf = STATUS_CONFIG[status];
                
                return (
                  <tr key={user.id} className="hover:bg-[#F9F9F9] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-[#EEEEEE]" />
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
                        className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: roleConf.bg, color: roleConf.color }}
                      >
                        <roleConf.icon size={11} />
                        {roleConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: statusConf.bg, color: statusConf.color }}
                      >
                        <statusConf.icon size={11} className={status === 'pending' ? 'animate-spin' : ''} />
                        {statusConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[#888888] capitalize">{user.authProvider}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {user.id !== currentUser?.id && (
                          <>
                            {status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleApprove(user)}
                                disabled={!!actionLoading}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-white bg-[#1A7A5E] hover:opacity-90 transition-opacity text-xs font-medium disabled:opacity-60 shadow-sm"
                              >
                                <CheckCircle size={13} /> Approve
                              </button>
                            )}
                            
                            {(status === 'pending' || status === 'approved') && (
                              <button
                                type="button"
                                onClick={() => handleBlock(user)}
                                disabled={!!actionLoading}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-red-600 border border-red-200 bg-white hover:bg-red-50 transition-colors text-xs font-medium disabled:opacity-60"
                              >
                                <Ban size={13} /> Block
                              </button>
                            )}

                            {status === 'blocked' && (
                              <button
                                type="button"
                                onClick={() => handleUnblock(user)}
                                disabled={!!actionLoading}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[#1A7A5E] border border-[#1A7A5E]/20 hover:bg-[#1A7A5E]/5 transition-colors text-xs font-medium disabled:opacity-60"
                              >
                                <CheckCircle size={13} /> Unblock
                              </button>
                            )}
                          </>
                        )}
                      </div>
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
