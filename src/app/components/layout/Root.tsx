import { Outlet, useLocation, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { useApp } from '../../context/AppContext';
import { PublicHeader } from './PublicHeader';
import { AuthSidebar, AuthTopBar } from './AuthSidebar';
import { FeedbackButton } from '../ui/FeedbackButton';

export function Root() {
  const { user } = useApp();
  const location = useLocation();

  if (user) {
    // Status-based routing guards
    if (user.status === 'pending' && location.pathname !== '/pending-approval') {
      return <Navigate to="/pending-approval" replace />;
    }
    if (user.status === 'blocked' && location.pathname !== '/blocked') {
      return <Navigate to="/blocked" replace />;
    }

    // Pending/blocked users see minimal layout (no sidebar/topbar)
    if (user.status === 'pending' || user.status === 'blocked') {
      return (
        <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
          <main className="flex-1">
            <Outlet />
          </main>
          <Toaster position="top-right" richColors />
        </div>
      );
    }

    // Approved users get full app layout
    return (
      <div className="flex h-screen overflow-hidden bg-[#F5F5F5]">
        <AuthSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AuthTopBar />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
        <FeedbackButton />
        <Toaster position="top-right" richColors />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
