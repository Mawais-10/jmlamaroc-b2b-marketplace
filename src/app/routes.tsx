import { createBrowserRouter } from 'react-router';
import { Root } from './components/layout/Root';
import LandingPage from './pages/LandingPage';
import SearchPage from './pages/SearchPage';
import GroupsPage from './pages/GroupsPage';
import StoreDetailPage from './pages/StoreDetailPage';
import TrendingPage from './pages/TrendingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FavoritesPage from './pages/FavoritesPage';
import CollectionsPage from './pages/CollectionsPage';
import CollectionDetailPage from './pages/CollectionDetailPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import SupplierApplyPage from './pages/SupplierApplyPage';
import SupplierDashboard from './pages/SupplierDashboard';
import { AdminLayout } from './pages/admin/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSupplierRequests from './pages/admin/AdminSupplierRequests';
import AdminStores from './pages/admin/AdminStores';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminSupport from './pages/admin/AdminSupport';

export const router = createBrowserRouter([
  // Main app
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: 'search', Component: SearchPage },
      { path: 'groups', Component: GroupsPage },
      { path: 'groups/:storeHandle', Component: StoreDetailPage },
      { path: 'trending', Component: TrendingPage },
      { path: 'login', Component: LoginPage },
      { path: 'register', Component: RegisterPage },
      { path: 'about', Component: AboutPage },
      { path: 'favorites', Component: FavoritesPage },
      { path: 'collections', Component: CollectionsPage },
      { path: 'collections/:id', Component: CollectionDetailPage },
      { path: 'settings', Component: SettingsPage },
      { path: 'settings/:tab', Component: SettingsPage },
      { path: 'support', Component: SupportPage },
      // Supplier flow
      { path: 'apply-supplier', Component: SupplierApplyPage },
      { path: 'store/dashboard', Component: SupplierDashboard },
      { path: 'store/dashboard/:tab', Component: SupplierDashboard },
      { path: '*', Component: NotFoundPage },
    ],
  },
  // Admin panel (separate layout)
  {
    path: '/admin',
    children: [
      { index: false, path: 'login', Component: AdminLoginPage },
      {
        path: '',
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: 'requests', Component: AdminSupplierRequests },
          { path: 'stores', Component: AdminStores },
          { path: 'users', Component: AdminUsers },
          { path: 'products', Component: AdminProducts },
          { path: 'support', Component: AdminSupport },
        ],
      },
    ],
  },
]);
