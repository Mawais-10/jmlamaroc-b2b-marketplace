import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Store, Phone, Send, MapPin, Tag, Eye, Filter } from 'lucide-react';
import { apiAdminGetRequests, apiAdminApproveRequest, apiAdminRejectRequest, ApiSupplierRequest } from '../../services/api';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  pending: '#E8820C',
  approved: '#E85D04',
  rejected: '#CC0000',
};

const STATUS_BG: Record<string, string> = {
  pending: '#FFF8E1',
  approved: '#FFF2EB',
  rejected: '#FEF2F2',
};

export default function AdminSupplierRequests() {
  const [requests, setRequests] = useState<ApiSupplierRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await apiAdminGetRequests(filter === 'all' ? undefined : filter);
      setRequests(res.requests);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, [filter]);

  const handleApprove = async (id: string, name: string) => {
    if (!confirm(`Approve supplier application for "${name}"? This will create their store and give them supplier access.`)) return;
    setActionLoading(id);
    try {
      const res = await apiAdminApproveRequest(id);
      toast.success(res.message);
      loadRequests();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal.id);
    try {
      await apiAdminRejectRequest(rejectModal.id, rejectReason);
      toast.success('Request rejected');
      setRejectModal(null);
      setRejectReason('');
      loadRequests();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Supplier Requests</h1>
          <p className="text-sm text-[#888888]">Review and approve supplier applications</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#FFF2EB' }}>
          <Filter size={14} style={{ color: '#E85D04' }} />
          <span className="text-sm font-medium" style={{ color: '#E85D04' }}>
            {requests.filter(r => r.status === 'pending').length} pending
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === f ? 'text-white' : 'text-[#888888] bg-white border border-[#CCCCCC] hover:border-[#E85D04]'
            }`}
            style={filter === f ? { backgroundColor: STATUS_COLORS[f] || '#E85D04' } : {}}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Requests list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-[#E85D04] border-t-transparent rounded-full" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-[#CCCCCC]">
          <CheckCircle size={48} className="mx-auto mb-4 text-[#CCCCCC]" />
          <p className="text-lg font-semibold text-[#444444]">No {filter !== 'all' ? filter : ''} requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req._id} className="bg-white rounded-xl border border-[#CCCCCC] overflow-hidden">
              {/* Request header */}
              <div className="flex items-center gap-4 p-4">
                <div style={{ backgroundColor: '#E85D04' }} className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                  {req.user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[#1A1A1A]">{req.businessName}</p>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: STATUS_BG[req.status], color: STATUS_COLORS[req.status] }}
                    >
                      {req.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#888888] mt-0.5 flex-wrap">
                    <span>By: {req.user?.name} ({req.user?.email})</span>
                    <span>@{req.storeHandle}</span>
                    <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExpandedId(expandedId === req._id ? null : req._id)}
                    className="p-2 rounded-lg border border-[#CCCCCC] hover:border-[#E85D04] transition-colors"
                  >
                    <Eye size={15} className="text-[#888888]" />
                  </button>
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(req._id, req.businessName)}
                        disabled={actionLoading === req._id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                        style={{ backgroundColor: '#E85D04' }}
                      >
                        {actionLoading === req._id ? (
                          <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <><CheckCircle size={14} /> Approve</>
                        )}
                      </button>
                      <button
                        onClick={() => setRejectModal({ id: req._id, name: req.businessName })}
                        disabled={actionLoading === req._id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 bg-red-500"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {expandedId === req._id && (
                <div className="border-t border-[#F5F5F5] px-4 py-4 grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[#444444]">
                      <Tag size={14} style={{ color: '#E85D04' }} />
                      <span>Category: <strong>{req.category}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-[#444444]">
                      <MapPin size={14} style={{ color: '#E85D04' }} />
                      <span>City: <strong>{req.city}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-[#444444]">
                      <Phone size={14} style={{ color: '#25D366' }} />
                      <span>WhatsApp: <strong>{req.whatsappNumber}</strong></span>
                    </div>
                    {req.telegramHandle && (
                      <div className="flex items-center gap-2 text-[#444444]">
                        <Send size={14} style={{ color: '#229ED9' }} />
                        <span>Telegram: <strong>@{req.telegramHandle}</strong></span>
                      </div>
                    )}
                  </div>
                  <div>
                    {req.description && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-[#888888] mb-1">Description:</p>
                        <p className="text-[#444444]">{req.description}</p>
                      </div>
                    )}
                    {req.message && (
                      <div>
                        <p className="text-xs font-medium text-[#888888] mb-1">Message:</p>
                        <p className="text-[#444444]">{req.message}</p>
                      </div>
                    )}
                    {req.adminNote && (
                      <div className="mt-2 p-2 bg-red-50 rounded-lg">
                        <p className="text-xs font-medium text-red-600 mb-1">Admin note:</p>
                        <p className="text-red-700 text-xs">{req.adminNote}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">Reject Application</h3>
            <p className="text-sm text-[#888888] mb-4">
              Rejecting <strong>{rejectModal.name}</strong>. Please provide a reason:
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional but helpful)..."
              rows={3}
              className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 transition-colors resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 py-2.5 rounded-xl border border-[#CCCCCC] text-sm font-medium text-[#444444] hover:bg-[#F5F5F5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!!actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
