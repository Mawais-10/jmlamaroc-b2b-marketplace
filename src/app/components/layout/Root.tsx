import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { useApp } from '../../context/AppContext';
import { PublicHeader } from './PublicHeader';
import { AuthSidebar, AuthTopBar } from './AuthSidebar';
import { FeedbackButton } from '../ui/FeedbackButton';

export function Root() {
  const { user } = useApp();

  if (user) {
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
