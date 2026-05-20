import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Settings, User, Key, Shield, Download, AlertTriangle, Eye, EyeOff, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

type TabId = 'profile' | 'password' | 'privacy';

export default function SettingsPage() {
  const { tab } = useParams<{ tab?: TabId }>();
  const activeTab: TabId = (tab as TabId) || 'profile';
  const navigate = useNavigate();
  const { user, updateUser, deleteAccount, downloadData } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login?redirect=/settings');
  }, [user]);

  useEffect(() => {
    if (user) { setName(user.name); setEmail(user.email); }
  }, [user]);

  if (!user) return null;

  const pwStrength = newPw.length === 0 ? 0 : newPw.length < 6 ? 1 : newPw.length < 10 ? 2 : newPw.match(/[A-Z]/) && newPw.match(/[0-9]/) ? 4 : 3;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#CC0000', '#E8820C', '#1A7A5E', '#1A7A5E'];

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Key },
    { id: 'privacy', label: 'Data & Privacy', icon: Shield },
  ];

  const handleSaveProfile = () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    updateUser({ name: name.trim() });
    toast.success('Profile updated!');
  };

  const handleUpdatePassword = () => {
    if (!currentPw || !newPw || !confirmPw) { toast.error('Please fill all fields'); return; }
    if (newPw !== confirmPw) { toast.error("Passwords don't match"); return; }
    if (newPw.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    toast.success('Password updated!');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirm !== 'DELETE') { toast.error('Please type DELETE to confirm'); return; }
    deleteAccount();
    navigate('/');
    toast.success('Account deleted');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#CCCCCC] px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: '#E8F5F0' }} className="p-2 rounded-xl">
              <Settings size={22} style={{ color: '#1A7A5E' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Settings</h1>
              <p className="text-sm text-[#888888]">Manage your account, password and personal data</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-6 flex-col md:flex-row">
          {/* Tab sidebar */}
          <div className="md:w-52 shrink-0">
            <div className="bg-white rounded-xl border border-[#CCCCCC] overflow-hidden">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => navigate(id === 'profile' ? '/settings' : `/settings/${id}`)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors text-left border-b border-[#F5F5F5] last:border-0 ${activeTab === id ? 'text-white' : 'text-[#444444] hover:bg-[#E8F5F0] hover:text-[#1A7A5E]'}`}
                  style={activeTab === id ? { backgroundColor: '#1A7A5E' } : {}}
                >
                  <Icon size={17} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl border border-[#CCCCCC] p-6">
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-6">Profile Settings</h2>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div style={{ backgroundColor: '#1A7A5E' }} className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border border-[#CCCCCC] flex items-center justify-center shadow-sm hover:bg-[#E8F5F0] transition-colors">
                      <Camera size={13} style={{ color: '#1A7A5E' }} />
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">{user.name}</p>
                    <p className="text-sm text-[#888888]">{user.email}</p>
                    {user.authProvider === 'google' && (
                      <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block" style={{ backgroundColor: '#E8F5F0', color: '#1A7A5E' }}>
                        Google Account
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#444444] mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A7A5E] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#444444] mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      disabled={user.authProvider === 'google'}
                      className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A7A5E] transition-colors disabled:bg-[#F5F5F5] disabled:text-[#888888] disabled:cursor-not-allowed"
                    />
                    {user.authProvider === 'google' && (
                      <p className="text-xs text-[#888888] mt-1">Email is managed by Google and cannot be changed here.</p>
                    )}
                  </div>
                  <button onClick={handleSaveProfile} className="px-6 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: '#1A7A5E' }}>
                    Save changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="bg-white rounded-xl border border-[#CCCCCC] p-6">
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-6">Change Password</h2>

                {user.authProvider === 'google' ? (
                  <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: '#E8F5F0' }}>
                    <Shield size={18} style={{ color: '#1A7A5E' }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-[#1A7A5E]">Google Account</p>
                      <p className="text-sm text-[#444444] mt-1">Your account uses Google Sign-In. Password management is handled by Google.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#444444] mb-1.5">Current Password</label>
                      <div className="relative">
                        <input type={showPw ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                          className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#1A7A5E] transition-colors" />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888]">
                          {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#444444] mb-1.5">New Password</label>
                      <input type={showPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)}
                        className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A7A5E] transition-colors" />
                      {newPw && (
                        <div className="mt-2">
                          <div className="flex gap-1 mb-1">
                            {[1, 2, 3, 4].map(l => (
                              <div key={l} className="flex-1 h-1 rounded-full" style={{ backgroundColor: l <= pwStrength ? strengthColor[pwStrength] : '#CCCCCC' }} />
                            ))}
                          </div>
                          <p className="text-xs" style={{ color: strengthColor[pwStrength] }}>{strengthLabel[pwStrength]}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#444444] mb-1.5">Confirm New Password</label>
                      <input type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${confirmPw && confirmPw !== newPw ? 'border-red-400' : 'border-[#CCCCCC] focus:border-[#1A7A5E]'}`} />
                    </div>
                    <button onClick={handleUpdatePassword} className="px-6 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: '#1A7A5E' }}>
                      Update Password
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-5">
                {/* Download data */}
                <div className="bg-white rounded-xl border border-[#CCCCCC] p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: '#E8F5F0' }}>
                      <Download size={18} style={{ color: '#1A7A5E' }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1A1A1A]">Download Your Data</h3>
                      <p className="text-sm text-[#888888] mt-1">Get a JSON file with all your account data, favorites, and search history.</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['Account info', 'Favorites', 'Search history'].map(item => (
                      <span key={item} className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: '#E8F5F0', color: '#1A7A5E' }}>
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => { downloadData(); toast.success('Data downloaded!'); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#3B82F6' }}
                  >
                    <Download size={16} /> Download my data
                  </button>
                </div>

                {/* Delete account */}
                {/* <div className="bg-white rounded-xl border-2 p-6" style={{ borderColor: '#CC0000' + '30' }}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-red-50">
                      <AlertTriangle size={18} style={{ color: '#CC0000' }} />
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ color: '#CC0000' }}>Delete Account</h3>
                      <p className="text-sm text-[#888888] mt-1">Permanently delete your account and all data. This action cannot be undone.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-5 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#CC0000' }}
                  >
                    Delete my account
                  </button>
                </div> */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete account modal */}
      {/* {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} style={{ color: '#CC0000' }} />
              <h2 className="text-lg font-bold" style={{ color: '#CC0000' }}>Delete Account</h2>
            </div>
            <p className="text-sm text-[#444444] mb-5">This will permanently delete your account. Type <strong>DELETE</strong> to confirm.</p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE"
              className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-red-400 transition-colors"
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }} className="flex-1 py-2.5 border border-[#CCCCCC] rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE'}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-40"
                style={{ backgroundColor: '#CC0000' }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
