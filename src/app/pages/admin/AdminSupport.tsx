import { useState, useEffect } from 'react';
import { Headphones, Filter, Search, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { apiAdminGetSupportTickets, apiAdminUpdateTicketStatus } from '../../services/api';
import { toast } from 'sonner';

export default function AdminSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await apiAdminGetSupportTickets({ status: statusFilter });
      setTickets(res.tickets);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await apiAdminUpdateTicketStatus(id, status);
      toast.success('Ticket status updated');
      fetchTickets();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update ticket');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-3">
            <Headphones size={24} className="text-[#E85D04]" />
            Support Tickets
          </h1>
          <p className="text-sm text-[#888888]">{total} tickets found</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white border border-[#CCCCCC] rounded-xl px-4 py-2 flex items-center gap-2">
            <Filter size={16} className="text-[#888888]" />
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="outline-none text-sm bg-transparent cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <button 
            onClick={fetchTickets}
            className="px-4 py-2 bg-[#E85D04] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#CCCCCC]">
          <Loader2 size={40} className="text-[#E85D04] animate-spin mb-4" />
          <p className="text-[#888888]">Loading tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#CCCCCC]">
          <Headphones size={48} className="mx-auto text-[#CBD5E1] mb-4" />
          <h3 className="text-lg font-bold text-[#1A1A1A]">No tickets found</h3>
          <p className="text-[#888888]">Everything seems to be clear!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#CCCCCC] overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#CCCCCC]">
                <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Subject</th>
                <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {tickets.map(ticket => (
                <tr key={ticket._id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                        {ticket.user?.avatar ? (
                          <img src={ticket.user.avatar} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-[#E85D04]">
                            {ticket.user?.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#1A1A1A] truncate">{ticket.user?.name || 'Unknown User'}</p>
                        <p className="text-xs text-[#888888] truncate">{ticket.user?.email || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="max-w-xs">
                      <p className="text-sm font-bold text-[#1A1A1A] mb-1">{ticket.subject}</p>
                      <p className="text-xs text-[#64748B] line-clamp-1">{ticket.message}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${
                        ticket.priority === 'high' ? 'bg-red-500' : 
                        ticket.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                      }`} />
                      <span className="text-xs capitalize text-[#64748B]">{ticket.priority}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs text-[#64748B]">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <select 
                        disabled={updatingId === ticket._id}
                        value={ticket.status}
                        onChange={(e) => handleUpdateStatus(ticket._id, e.target.value)}
                        className="text-xs border border-[#CCCCCC] rounded-lg px-2 py-1 outline-none hover:border-[#E85D04] transition-colors disabled:opacity-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      {updatingId === ticket._id && <Loader2 size={14} className="animate-spin text-[#E85D04]" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
