import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Clock, LogOut, RefreshCw, Shield, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiGetMe } from '../services/api';

export default function PendingApprovalPage() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [dots, setDots] = useState('');

  // Animate the waiting dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Poll every 15 seconds to check if status changed
  useEffect(() => {
    const pollStatus = async () => {
      try {
        const res = await apiGetMe();
        if (res?.user?.status === 'approved') {
          // Reload the page to re-trigger auth flow with approved status
          window.location.href = '/search';
        }
        if (res?.user?.status === 'blocked') {
          window.location.href = '/blocked';
        }
      } catch {
        // Ignore poll errors
      }
    };

    const interval = setInterval(pollStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleManualCheck = async () => {
    setChecking(true);
    try {
      const res = await apiGetMe();
      if (res?.user?.status === 'approved') {
        window.location.href = '/search';
      } else if (res?.user?.status === 'blocked') {
        window.location.href = '/blocked';
      }
    } catch {
      // ignore
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen  flex items-center justify-center p-10" style={{ background: 'linear-gradient(135deg, #0F1F1A 0%, #1E3A30 50%, #0F1F1A 100%)' }}>
      {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #1A7A5E, transparent)' }} />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #E8820C, transparent)' }} />
        </div>

      <div className="relative w-full max-w-lg">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #664520ff, #1A7A5E)' }} />

          <div className="p-8 sm:p-10 text-center">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div style={{ backgroundColor: '#1A7A5E' }} className="w-10 h-10 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div className="text-left">
                <span className="text-[#1A1A1A] text-xl font-bold">ChouFliya</span>
                <p className="text-xs tracking-widest font-bold" style={{ color: '#E8820C' }}>CHOUFLIYA.MA</p>
              </div>
            </div>

            {/* Animated icon */}
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full opacity-20" style={{ backgroundColor: '#E8820C' }} />
              <div className="relative w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF8E1' }}>
                <Clock size={36} style={{ color: '#E8820C' }} className="animate-pulse" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
              Account Under Review  
            </h1>
            <p className="text-[#888888] text-sm leading-relaxed mb-8 max-w-sm mx-auto">
              Thank you for signing up, <span className="font-semibold text-[#444444]">{user?.name}</span>! 
              Your account is being reviewed by our admin team. You'll get full access once approved.
            </p>

            {/* Info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {[
                { icon: Shield, label: 'Secure Review', desc: 'We verify all accounts' },
                { icon: Clock, label: 'Quick Process', desc: 'Usually within hours' },
                { icon: CheckCircle2, label: 'Auto Notified', desc: "We'll let you know" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="rounded-xl p-3 border border-[#F0F0F0]" style={{ backgroundColor: '#FAFAFA' }}>
                  <Icon size={18} className="mx-auto mb-1.5" style={{ color: '#1A7A5E' }} />
                  <p className="text-xs font-semibold text-[#444444]">{label}</p>
                  <p className="text-xs text-[#888888]">{desc}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleManualCheck}
                disabled={checking}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ backgroundColor: '#1A7A5E' }}
              >
                {checking ? (
                  <><RefreshCw size={16} className="animate-spin" /> Checking status...</>
                ) : (
                  <><RefreshCw size={16} /> Check Approval Status</>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-xl text-[#888888] font-medium text-sm border border-[#E0E0E0] hover:bg-[#F5F5F5] transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>

            {/* Status indicator */}
            {/* <div className="mt-6 pt-4 border-t border-[#F0F0F0]">
              <div className="flex items-center justify-center gap-2 text-xs text-[#888888]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#E8820C' }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#E8820C' }} />
                </span>
                Auto-checking every 15 seconds
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
