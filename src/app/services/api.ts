/**
 * JML Maroc API Service
 * Connects to the Node.js backend at port 5000.
 * Run: cd server && npm install && node seed.js && npm start
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api'; // Proxied in dev, absolute in prod if set

const getToken = (isAdminRequest: boolean) => {
  if (isAdminRequest) return localStorage.getItem('jmlmaroc_admin_token') || localStorage.getItem('jmlmaroc_token');
  return localStorage.getItem('jmlmaroc_token');
};

const authHeaders = (isAdminRequest: boolean): HeadersInit => ({
  'Content-Type': 'application/json',
  ...(getToken(isAdminRequest) ? { Authorization: `Bearer ${getToken(isAdminRequest)}` } : {}),
});

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const isAdminRequest = url.startsWith('/admin');
  console.log(`[API] Calling: ${API_BASE}${url}`, options?.method || 'GET');
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...authHeaders(isAdminRequest),
      ...(options?.headers || {}),
    },
  });

  const contentType = res.headers.get('content-type');
  let data: any = {};
  
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    // If not JSON, get text or just return empty
    const text = await res.text();
    if (!res.ok) throw new Error(text || 'API error');
    return {} as T;
  }

  if (!res.ok) {
    if (data.statusCode === 'BLOCKED') {
      console.log('User is blocked - clearing session');
      localStorage.removeItem('jmlmaroc_token');
      window.location.href = '/blocked';
    }
    throw new Error(data.message || 'API error');
  }
  return data as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const apiLogin = (email: string, password: string) =>
  request<{ success: boolean; token: string; user: ApiUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const apiRegister = (name: string, email: string, password: string, country = 'MA') =>
  request<{ success: boolean; token: string; user: ApiUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, country }),
  });

export const apiGoogleAuth = (credential: string) =>
  request<{ success: boolean; token: string; user: ApiUser }>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });

export const apiGoogleAccess = (data: { sub: string; email: string; name: string; picture?: string }) =>
  request<{ success: boolean; token: string; user: ApiUser }>('/auth/google-access', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const apiGetMe = () =>
  request<{ success: boolean; user: ApiUser }>('/auth/me');

export const apiUpdateProfile = (data: { name?: string; country?: string; language?: string }) =>
  request<{ success: boolean; user: ApiUser }>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const apiChangePassword = (currentPassword: string, newPassword: string) =>
  request<{ success: boolean; message: string }>('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });

export const apiAddFavorite = (productId: string) =>
  request<{ success: boolean; favorites: string[] }>(`/auth/favorites/${productId}`, { method: 'POST' });

export const apiRemoveFavorite = (productId: string) =>
  request<{ success: boolean; favorites: string[] }>(`/auth/favorites/${productId}`, { method: 'DELETE' });

export const apiDeleteAccount = () =>
  request<{ success: boolean }>('/auth/account', { method: 'DELETE' });

// ─── Stores ──────────────────────────────────────────────────────────────────

export const apiGetStores = (params?: Record<string, string>) =>
  request<{ success: boolean; stores: ApiStore[]; total: number }>(`/stores${params ? '?' + new URLSearchParams(params) : ''}`);

export const apiGetStore = (handle: string) =>
  request<{ success: boolean; store: ApiStore; products: ApiProduct[] }>(`/stores/${handle}`);

// ─── Products ────────────────────────────────────────────────────────────────

export const apiGetProducts = (params?: Record<string, string>) =>
  request<{ success: boolean; products: ApiProduct[]; total: number }>(`/products${params ? '?' + new URLSearchParams(params) : ''}`);

// ─── Supplier ────────────────────────────────────────────────────────────────

export const apiApplySupplier = (data: SupplierApplyData) =>
  request<{ success: boolean; message: string; request: ApiSupplierRequest }>('/supplier/apply', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const apiGetSupplierRequestStatus = () =>
  request<{ success: boolean; request: ApiSupplierRequest | null }>('/supplier/request-status');

export const apiGetMyStore = () =>
  request<{ success: boolean; store: ApiStore }>('/supplier/store');

export const apiUpdateMyStore = (data: Partial<ApiStore>) =>
  request<{ success: boolean; store: ApiStore }>('/supplier/store', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const apiUploadStoreAvatar = (file: File) => {
  const fd = new FormData();
  fd.append('avatar', file);
  return fetch(`${API_BASE}/supplier/store/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken(false)}` },
    body: fd,
  }).then(r => r.json()) as Promise<{ success: boolean; store: ApiStore; avatarUrl: string }>;
};

export const apiUploadStoreCover = (file: File) => {
  const fd = new FormData();
  fd.append('cover', file);
  return fetch(`${API_BASE}/supplier/store/cover`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken(false)}` },
    body: fd,
  }).then(r => r.json()) as Promise<{ success: boolean; store: ApiStore; coverUrl: string }>;
};

export const apiRemoveStoreCover = (index: number) =>
  request<{ success: boolean; store: ApiStore }>(`/supplier/store/cover/${index}`, { method: 'DELETE' });

export const apiGetMyProducts = () =>
  request<{ success: boolean; products: ApiProduct[] }>('/supplier/products');

export const apiAddProduct = (formData: FormData) =>
  fetch(`${API_BASE}/supplier/products`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken(false)}` },
    body: formData,
  }).then(r => r.json()) as Promise<{ success: boolean; product: ApiProduct }>;

export const apiUpdateProduct = (id: string, data: Partial<ApiProduct>) =>
  request<{ success: boolean; product: ApiProduct }>(`/supplier/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const apiDeleteProduct = (id: string) =>
  request<{ success: boolean; message: string }>(`/supplier/products/${id}`, { method: 'DELETE' });

// ─── Telegram Integration ────────────────────────────────────────────────────

export const apiConnectTelegram = (channelUsername: string) =>
  request<{ success: boolean; message: string; syncStatus: string }>('/supplier/connect-telegram', {
    method: 'POST',
    body: JSON.stringify({ channelUsername }),
  });

export const apiGetTelegramSyncStatus = () =>
  request<{
    success: boolean;
    syncStatus: string;
    syncProgress: number;
    syncError: string;
    lastSync: string | null;
    telegramHandle: string;
    telegramProductCount: number;
    needsReviewCount: number;
  }>('/supplier/telegram-sync-status');

// ─── Admin ───────────────────────────────────────────────────────────────────

export const apiAdminStats = () =>
  request<{ success: boolean; stats: AdminStats }>('/admin/stats');

export const apiAdminGetRequests = (status?: string) =>
  request<{ success: boolean; requests: ApiSupplierRequest[] }>(`/admin/supplier-requests${status ? '?status=' + status : ''}`);

export const apiAdminApproveRequest = (id: string) =>
  request<{ success: boolean; message: string; store: ApiStore }>(`/admin/supplier-requests/${id}/approve`, { method: 'PUT' });

export const apiAdminRejectRequest = (id: string, reason: string) =>
  request<{ success: boolean; message: string }>(`/admin/supplier-requests/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });

export const apiAdminGetUsers = (params?: Record<string, string>) =>
  request<{ success: boolean; users: ApiUser[]; total: number }>(`/admin/users${params ? '?' + new URLSearchParams(params) : ''}`);

export const apiAdminDeactivateUser = (id: string) =>
  request<{ success: boolean }>(`/admin/users/${id}/deactivate`, { method: 'PUT' });

export const apiAdminApproveUser = (id: string) =>
  request<{ success: boolean; user: ApiUser; message: string }>(`/admin/users/${id}/approve`, { method: 'PUT' });

export const apiAdminBlockUser = (id: string) =>
  request<{ success: boolean; user: ApiUser; message: string }>(`/admin/users/${id}/block`, { method: 'PUT' });

export const apiAdminUnblockUser = (id: string) =>
  request<{ success: boolean; user: ApiUser; message: string }>(`/admin/users/${id}/unblock`, { method: 'PUT' });

export const apiAdminGetStores = (params?: Record<string, string>) =>
  request<{ success: boolean; stores: ApiStore[]; total: number }>(`/admin/stores${params ? '?' + new URLSearchParams(params) : ''}`);

export const apiAdminToggleStore = (id: string) =>
  request<{ success: boolean; store: ApiStore; message: string }>(`/admin/stores/${id}/toggle`, { method: 'PUT' });

export const apiAdminDeleteStore = (id: string) =>
  request<{ success: boolean }>(`/admin/stores/${id}`, { method: 'DELETE' });

export const apiAdminGetProducts = (params?: Record<string, string>) =>
  request<{ success: boolean; products: ApiProduct[]; total: number }>(`/admin/products${params ? '?' + new URLSearchParams(params) : ''}`);

export const apiAdminDeleteProduct = (id: string) =>
  request<{ success: boolean }>(`/admin/products/${id}`, { method: 'DELETE' });

// ─── Search Sessions ─────────────────────────────────────────────────────────

export const apiCreateSearchSession = (filters: any) =>
  request<{ sessionId: string }>('/search/sessions', {
    method: 'POST',
    body: JSON.stringify({ filters }),
  });

export const apiGetSearchSession = (id: string) =>
  request<ApiSearchSession>(`/search/sessions/${id}`);

export const apiSearchVisual = (file: File) => {
  const fd = new FormData();
  fd.append('image', file);
  return fetch(`${API_BASE}/search/visual`, {
    method: 'POST',
    headers: {
      // Don't set Content-Type, fetch will set it with boundary for FormData
      ...(getToken(false) ? { Authorization: `Bearer ${getToken(false)}` } : {}),
    },
    body: fd,
  }).then(r => r.json()) as Promise<{ success: boolean; products: ApiProduct[] }>;
};

export const apiSearchVisualUrl = (imageUrl: string, productId?: string) =>
  request<{ success: boolean; products: ApiProduct[] }>('/search/visual-url', {
    method: 'POST',
    body: JSON.stringify({ imageUrl, productId }),
  });

// ─── Notifications ───────────────────────────────────────────────────────────

export const apiGetNotifications = () =>
  request<{ success: boolean; notifications: ApiNotification[] }>('/notifications');

export const apiMarkNotificationRead = (id: string) =>
  request<{ success: boolean; notification: ApiNotification }>(`/notifications/${id}/read`, { method: 'PUT' });

export const apiMarkAllNotificationsRead = () => request<{ success: boolean }>('/notifications/read-all', { method: 'PUT' });

// Support
export const apiCreateSupportTicket = (data: { subject: string; message: string; category: string; priority?: string }) => 
  request<{ success: boolean; ticket: any }>('/support/tickets', { method: 'POST', body: JSON.stringify(data) });

export const apiGetMyTickets = () => request<{ success: boolean; tickets: any[] }>('/support/my-tickets');

// ─── Collections ─────────────────────────────────────────────────────────────

export const apiGetCollections = () =>
  request<{ success: boolean; collections: any[] }>('/collections');

export const apiCreateCollection = (data: { name: string; description?: string; color?: string; items?: string[] }) =>
  request<{ success: boolean; collection: any }>('/collections', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const apiUpdateCollection = (id: string, data: Partial<{ name: string; description: string; color: string; items: string[] }>) =>
  request<{ success: boolean; collection: any }>(`/collections/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const apiDeleteCollection = (id: string) =>
  request<{ success: boolean; message: string }>(`/collections/${id}`, { method: 'DELETE' });

export const apiAddItemToCollection = (collectionId: string, productId: string) =>
  request<{ success: boolean; collection: any }>(`/collections/${collectionId}/items`, {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });

// Admin - Support
export const apiAdminGetSupportTickets = (params?: any) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return request<{ success: boolean; tickets: any[]; total: number }>(`/admin/support-tickets${qs}`);
};

export const apiAdminUpdateTicketStatus = (id: string, status: string) => 
  request<{ success: boolean; ticket: any }>(`/admin/support-tickets/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });

export const apiGetSettings = () =>
  request<{ success: boolean; settings: ApiSiteSettings }>('/settings');

export const apiAdminGetSettings = () =>
  request<{ success: boolean; settings: ApiSiteSettings }>('/admin/settings');

export const apiAdminUpdateSettings = (data: Partial<ApiSiteSettings>) =>
  request<{ success: boolean; settings: ApiSiteSettings }>('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export interface ApiSiteSettings {
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  instagramLink: string;
  facebookLink: string;
  linkedinLink: string;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApiNotification {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiSearchSession {
  sessionId: string;
  filters: {
    q?: string;
    category?: string;
    storeId?: string;
    sortBy?: string;
    priceOnly?: boolean;
    showDuplicates?: boolean;
    uploadedImage?: string;
  };
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'buyer' | 'supplier' | 'admin';
  status?: 'pending' | 'approved' | 'blocked';
  country: string;
  language: string;
  authProvider: 'local' | 'google';
  storeId?: string;
  favorites?: string[];
  createdAt?: string;
}

export interface ApiStore {
  _id: string;
  id?: string;
  name: string;
  handle: string;
  description: string;
  avatar: string;
  coverImages: { url: string; publicId?: string }[];
  categories: string[];
  city: string;
  telegramHandle: string;
  telegramLink: string;
  whatsappNumber: string;
  whatsappLink: string;
  productCount: number;
  followerCount: number;
  isApproved: boolean;
  previewProducts?: { imageUrl: string }[];
  createdAt: string;
  telegramSyncStatus?: string;
  telegramSyncProgress?: number;
  telegramSyncError?: string;
  lastTelegramSync?: string;
}

export interface ApiProduct {
  _id: string;
  id?: string;
  store: string;
  storeName: string;
  storeHandle: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number | null;
  currency: string;
  category: string;
  subcategory: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  source?: string;
  sourceChannel?: string;
  sourceMessageId?: number;
  needsReview?: boolean;
}

export interface ApiSupplierRequest {
  _id: string;
  user: { _id: string; name: string; email: string; avatar?: string; createdAt: string };
  businessName: string;
  storeHandle: string;
  description: string;
  category: string;
  city: string;
  whatsappNumber: string;
  telegramHandle: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface SupplierApplyData {
  businessName: string;
  storeHandle: string;
  description: string;
  category: string;
  city: string;
  whatsappNumber: string;
  telegramHandle: string;
  message: string;
}

export interface AdminStats {
  totalUsers: number;
  totalStores: number;
  totalProducts: number;
  pendingRequests: number;
  buyers: number;
  suppliers: number;
  pendingUsers: number;
  blockedUsers: number;
}
