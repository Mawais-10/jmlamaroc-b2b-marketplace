import { useNavigate } from 'react-router';
import { ShieldAlert, LogOut, MessageSquare, Home } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BlockedPage() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSupport = () => {
    navigate('/support');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAFAFA]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 bg-red-500" />

          <div className="p-8 text-center">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
              <ShieldAlert size={32} className="text-red-500" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Account Suspended</h1>
            <p className="text-[#888888] text-sm leading-relaxed mb-8">
              Hello <span className="font-semibold text-[#444444]">{user?.name}</span>, your account has been suspended by an administrator. This usually happens due to a violation of our terms of service or suspicious activity.
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleSupport}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: '#EF4444' }}
              >
                <MessageSquare size={16} /> Contact Support
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleGoHome}
                  className="py-3 rounded-xl text-[#444444] font-medium text-sm border border-[#E0E0E0] hover:bg-[#F5F5F5] transition-colors flex items-center justify-center gap-2"
                >
                  <Home size={16} /> Home
                </button>
                <button
                  onClick={handleLogout}
                  className="py-3 rounded-xl text-[#444444] font-medium text-sm border border-[#E0E0E0] hover:bg-[#F5F5F5] transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>

            {/* Contact info */}
            <p className="mt-8 text-xs text-[#AAAAAA]">
              If you believe this is a mistake, please reach out to our team at support@choufliya.ma
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
