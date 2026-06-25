import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div style={{ backgroundColor: '#FFF2EB' }} className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
        <span className="text-4xl">🔍</span>
      </div>
      <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Page Not Found</h1>
      <p className="text-[#888888] mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <div className="flex gap-3">
        <button onClick={() => navigate(-1)} className="px-5 py-2.5 border border-[#CCCCCC] rounded-xl text-sm font-medium text-[#444444] hover:bg-[#F5F5F5] transition-colors">
          Go Back
        </button>
        <button onClick={() => navigate('/')} className="px-5 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: '#E85D04' }}>
          Home
        </button>
      </div>
    </div>
  );
}
