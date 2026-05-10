import { useState } from 'react';
import { MessageSquare, X, Star } from 'lucide-react';
import { toast } from 'sonner';

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);

  const handleSubmit = () => {
    if (!message.trim()) { toast.error('Please enter your feedback'); return; }
    toast.success('Thank you for your feedback!');
    setMessage(''); setRating(0); setOpen(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-full text-white shadow-lg hover:opacity-90 transition-all z-40 text-sm font-medium"
        style={{ backgroundColor: '#1A7A5E' }}
      >
        <MessageSquare size={18} />
        <span>Feedback</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={20} className="text-[#888888]" />
            </button>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-1">Share Feedback</h2>
            <p className="text-sm text-[#888888] mb-5">Help us improve ChouFliya for you</p>

            {/* Rating */}
            <div className="mb-4">
              <label className="text-sm font-medium text-[#444444] block mb-2">How was your experience?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110">
                    <Star
                      size={28}
                      fill={star <= rating ? '#E8820C' : 'none'}
                      stroke={star <= rating ? '#E8820C' : '#CCCCCC'}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="mb-5">
              <label className="text-sm font-medium text-[#444444] block mb-2">Your feedback</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full border border-[#CCCCCC] rounded-lg p-3 text-sm text-[#1A1A1A] placeholder:text-[#888888] focus:outline-none resize-none"
                placeholder="Tell us what you think..."
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setOpen(false)} className="flex-1 py-2.5 border border-[#CCCCCC] rounded-lg text-sm font-medium text-[#444444] hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: '#1A7A5E' }}>
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
