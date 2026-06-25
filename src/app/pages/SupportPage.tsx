import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Headphones, Plus, X, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { apiCreateSupportTicket } from '../services/api';

type StatusFilter = 'all' | 'pending' | 'in-progress' | 'resolved' | 'closed';

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: '#FFF2EB', text: '#E85D04' },
  'in-progress': { label: 'In Progress', bg: '#FFF3E0', text: '#E8820C' },
  resolved: { label: 'Resolved', bg: '#E3F2FD', text: '#1976D2' },
  closed: { label: 'Closed', bg: '#F5F5F5', text: '#888888' },
};

export default function SupportPage() {
  const { user, tickets, addTicket } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Technical Issue');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login?redirect=/support');
  }, [user]);

  if (!user) return null;

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) { toast.error('Please fill in all required fields'); return; }
    setSubmitting(true);
    try {
      const res = await apiCreateSupportTicket({ subject, category, message, priority: 'medium' });
      addTicket(res.ticket);
      toast.success('Ticket submitted successfully! Admin will review it soon.');
      setSubject(''); setCategory('Technical Issue'); setMessage('');
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const tabs: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'resolved', label: 'Resolved' },
    { id: 'closed', label: 'Closed' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#CCCCCC] px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: '#FFF2EB' }} className="p-2 rounded-xl">
              <Headphones size={22} style={{ color: '#E85D04' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Support</h1>
              <p className="text-sm text-[#888888]">How can we help you?</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#E85D04' }}
          >
            <Plus size={16} /> New Ticket
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl border border-[#CCCCCC] p-1 w-fit">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={filter === id ? { backgroundColor: '#E85D04', color: '#fff' } : { color: '#444444' }}
            >
              {label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-[#CCCCCC]">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: '#FFF2EB' }}>
              <FileText size={40} className="text-[#CCCCCC]" />
            </div>
            <h2 className="text-xl font-semibold text-[#444444] mb-2">No tickets yet</h2>
            <p className="text-sm text-[#888888] mb-6">
              {filter !== 'all' ? `No ${filter.replace('-', ' ')} tickets` : 'Open your first support ticket to get help'}
            </p>
            {filter === 'all' && (
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: '#E85D04' }}>
                <Plus size={16} /> Open your first ticket
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(ticket => {
              const statusStyle = STATUS_STYLES[ticket.status] || STATUS_STYLES.open;
              return (
                <div key={ticket.id} className="bg-white rounded-xl border border-[#CCCCCC] p-5 hover:border-[#E85D04] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-[#1A1A1A]">{ticket.subject}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                          {statusStyle.label}
                        </span>
                      </div>
                      <p className="text-sm text-[#888888] line-clamp-2">{ticket.message}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-[#888888]">{new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      <p className="text-xs font-medium mt-1" style={{ color: '#E8820C' }}>{ticket.category}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New ticket modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={20} className="text-[#888888]" />
            </button>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-5">New Support Ticket</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#444444] mb-1.5">Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#444444] mb-1.5">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04] transition-colors bg-white appearance-none">
                  <option>Technical Issue</option>
                  <option>Billing</option>
                  <option>General</option>
                  <option>Account</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#444444] mb-1.5">Message *</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..." rows={5}
                  className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04] transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#444444] mb-1.5">Attachment (optional)</label>
                <div className="border-2 border-dashed border-[#CCCCCC] rounded-xl p-4 text-center text-sm text-[#888888] hover:border-[#E85D04] transition-colors cursor-pointer">
                  Click to upload or drag and drop a file
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-[#CCCCCC] rounded-xl text-sm font-medium text-[#444444] hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ backgroundColor: '#E85D04' }}>
                {submitting ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Submitting...</> : 'Submit Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
