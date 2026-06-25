import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  apiGetMe, apiLogin, apiRegister, apiGoogleAuth, apiGoogleAccess, apiUpdateProfile,
  apiAddFavorite, apiRemoveFavorite, apiDeleteAccount,
  apiGetNotifications, apiMarkNotificationRead, apiMarkAllNotificationsRead,
  apiGetMyTickets, apiCreateSupportTicket,
  apiGetCollections, apiCreateCollection, apiUpdateCollection, apiDeleteCollection, apiAddItemToCollection,
  ApiUser, ApiNotification, apiGetSettings
} from '../services/api';
import { Collection, SupportTicket } from '../data/mockData';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  authProvider: 'local' | 'google';
  role: 'buyer' | 'supplier' | 'admin';
  status: 'pending' | 'approved' | 'blocked';
  country: string;
  language: string;
  storeId?: string;
}

interface AppState {
  user: User | null;
  isLoading: boolean;
  favorites: string[];
  collections: Collection[];
  tickets: SupportTicket[];
  sidebarCollapsed: boolean;
  isApiAvailable: boolean;
  unreadNotifications: number;
  siteEmail: string;
  sitePhone: string;
  siteWhatsapp: string;
  siteInstagram: string;
  siteFacebook: string;
  siteLinkedin: string;
  language: string;
}

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_FAVORITES'; payload: string[] }
  | { type: 'ADD_FAVORITE'; payload: string }
  | { type: 'REMOVE_FAVORITE'; payload: string }
  | { type: 'ADD_COLLECTION'; payload: Collection }
  | { type: 'SET_COLLECTIONS'; payload: Collection[] }
  | { type: 'DELETE_COLLECTION'; payload: string }
  | { type: 'UPDATE_COLLECTION'; payload: { id: string; updates: Partial<Collection> } }
  | { type: 'ADD_TO_COLLECTION'; payload: { collectionId: string; productId: string } }
  | { type: 'ADD_TICKET'; payload: SupportTicket }
  | { type: 'SET_TICKETS'; payload: SupportTicket[] }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'SET_API_STATUS'; payload: boolean }
  | { type: 'SET_NOTIFICATIONS'; payload: ApiNotification[] }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'SET_SITE_SETTINGS'; payload: { email: string; phoneNumber: string; whatsappNumber: string; instagramLink: string; facebookLink: string; linkedinLink: string } }
  | { type: 'SET_LANGUAGE'; payload: string };

const initialState: AppState = {
  user: null,
  isLoading: true,
  favorites: [],
  collections: [],
  tickets: [],
  sidebarCollapsed: false,
  isApiAvailable: false,
  notifications: [],
  unreadNotifications: 0,
  siteEmail: 'contact@jmlamaroc.com',
  sitePhone: '0779 137 560',
  siteWhatsapp: '212779137560',
  siteInstagram: 'https://instagram.com',
  siteFacebook: 'https://facebook.com',
  siteLinkedin: 'https://linkedin.com',
  language: localStorage.getItem('jmlmaroc_lang') || 'en',
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN':
      return { ...state, user: action.payload, isLoading: false };
    case 'LOGOUT':
      return { ...state, user: null, favorites: [], isLoading: false };
    case 'UPDATE_USER':
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : null };
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };
    case 'ADD_FAVORITE':
      if (state.favorites.includes(action.payload)) return state;
      return { ...state, favorites: [...state.favorites, action.payload] };
    case 'REMOVE_FAVORITE':
      return { ...state, favorites: state.favorites.filter(id => id !== action.payload) };
    case 'ADD_COLLECTION':
      return { ...state, collections: [...state.collections, action.payload] };
    case 'SET_COLLECTIONS':
      return { ...state, collections: action.payload };
    case 'DELETE_COLLECTION':
      return { ...state, collections: state.collections.filter(c => c.id !== action.payload) };
    case 'UPDATE_COLLECTION':
      return {
        ...state,
        collections: state.collections.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c
        ),
      };
    case 'ADD_TO_COLLECTION':
      return {
        ...state,
        collections: state.collections.map(c =>
          c.id === action.payload.collectionId && !c.items.includes(action.payload.productId)
            ? { ...c, items: [...c.items, action.payload.productId] }
            : c
        ),
      };
    case 'ADD_TICKET':
      return { ...state, tickets: [action.payload, ...state.tickets] };
    case 'SET_TICKETS':
      return { ...state, tickets: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'SET_SIDEBAR':
      return { ...state, sidebarCollapsed: action.payload };
    case 'SET_API_STATUS':
      return { ...state, isApiAvailable: action.payload };
    case 'SET_NOTIFICATIONS':
      return { 
        ...state, 
        notifications: action.payload,
        unreadNotifications: action.payload.filter(n => !n.isRead).length
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => n._id === action.payload ? { ...n, isRead: true } : n),
        unreadNotifications: Math.max(0, state.unreadNotifications - 1)
      };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadNotifications: 0
      };
    case 'SET_SITE_SETTINGS':
      return {
        ...state,
        siteEmail: action.payload.email || state.siteEmail,
        sitePhone: action.payload.phoneNumber || state.sitePhone,
        siteWhatsapp: action.payload.whatsappNumber || state.siteWhatsapp,
        siteInstagram: action.payload.instagramLink || state.siteInstagram,
        siteFacebook: action.payload.facebookLink || state.siteFacebook,
        siteLinkedin: action.payload.linkedinLink || state.siteLinkedin
      };
    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.payload
      };
    default:
      return state;
  }
}

const mapApiUser = (u: ApiUser): User => ({
  id: u.id,
  name: u.name,
  email: u.email,
  avatar: u.avatar,
  authProvider: u.authProvider,
  role: u.role,
  status: u.status || 'pending',
  country: u.country,
  language: u.language,
  storeId: u.storeId,
});

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (credential: string, googleAccessData?: { sub: string; email: string; name: string; picture?: string }) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  addCollection: (collection: Omit<Collection, 'id' | 'createdAt'>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  updateCollection: (id: string, updates: Partial<Collection>) => Promise<void>;
  addToCollection: (collectionId: string, productId: string) => Promise<void>;
  addTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'replies'>) => Promise<void>;
  toggleSidebar: () => void;
  downloadData: () => void;
  refreshNotifications: () => Promise<void>;
  refreshTickets: () => Promise<void>;
  refreshCollections: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  setLanguage: (lang: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // On mount: check JWT token → fetch user
  useEffect(() => {
    // Set initial direction
    const initialLang = localStorage.getItem('jmlmaroc_lang') || 'en';
    document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = initialLang;

    // Fetch general site configuration
    apiGetSettings()
      .then(res => {
        if (res.success && res.settings) {
          dispatch({ type: 'SET_SITE_SETTINGS', payload: res.settings });
        }
      })
      .catch(err => console.error('Failed to load settings:', err));

    const token = localStorage.getItem('jmlmaroc_token');
    if (!token) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }
    apiGetMe()
      .then(res => {
        if (res && res.user) {
          // If the user is an admin, they shouldn't be logged into the main site context
          if (res.user.role === 'admin') {
            console.log('Admin detected on main site - logging out to maintain separation');
            localStorage.removeItem('jmlmaroc_token');
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
          }
          // If user is blocked, clear token and don't log in
          if (res.user.status === 'blocked') {
            console.log('Blocked user detected, clearing session');
            localStorage.removeItem('jmlmaroc_token');
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
          }
          dispatch({ type: 'LOGIN', payload: mapApiUser(res.user) });
          dispatch({ type: 'SET_API_STATUS', payload: true });
          if (res.user.favorites) dispatch({ type: 'SET_FAVORITES', payload: res.user.favorites });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      })
      .catch(err => {
        console.error('Auth check failed:', err);
        localStorage.removeItem('jmlmaroc_token');
        dispatch({ type: 'SET_LOADING', payload: false });
      });
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await apiLogin(email, password);
      // Blocked users: don't store token
      if (res.user.status === 'blocked') {
        throw new Error('Your account has been suspended. Contact support.');
      }
      localStorage.setItem('jmlmaroc_token', res.token);
      dispatch({ type: 'LOGIN', payload: mapApiUser(res.user) });
      dispatch({ type: 'SET_API_STATUS', payload: true });
      return true;
    } catch (err: any) {
      // Re-throw blocked errors so the UI can show them
      if (err?.message?.includes('suspended')) throw err;
      return false;
    }
  };

  const loginWithGoogle = async (credential: string, googleAccessData?: { sub: string; email: string; name: string; picture?: string }): Promise<boolean> => {
    try {
      let res;
      if (googleAccessData) {
        res = await apiGoogleAccess(googleAccessData);
      } else if (credential) {
        res = await apiGoogleAuth(credential);
      } else {
        res = await apiGetMe();
      }
      
      if (res.token) localStorage.setItem('jmlmaroc_token', res.token);
      dispatch({ type: 'LOGIN', payload: mapApiUser(res.user) });
      dispatch({ type: 'SET_API_STATUS', payload: true });
      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      throw err; // Propagate error to UI
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await apiRegister(name, email, password);
      // New users are pending — store token so we can redirect to pending page
      localStorage.setItem('jmlmaroc_token', res.token);
      dispatch({ type: 'LOGIN', payload: mapApiUser(res.user) });
      dispatch({ type: 'SET_API_STATUS', payload: true });
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('jmlmaroc_token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      const res = await apiUpdateProfile(updates);
      dispatch({ type: 'UPDATE_USER', payload: mapApiUser(res.user) });
    } catch {
      dispatch({ type: 'UPDATE_USER', payload: updates });
    }
  };

  const deleteAccount = async () => {
    try {
      await apiDeleteAccount();
    } catch { /* ignore */ }
    localStorage.removeItem('jmlmaroc_token');
    dispatch({ type: 'LOGOUT' });
  };

  const addFavorite = useCallback((id: string) => {
    dispatch({ type: 'ADD_FAVORITE', payload: id });
    apiAddFavorite(id).catch(() => { });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: id });
    apiRemoveFavorite(id).catch(() => { });
  }, []);

  const isFavorite = (id: string) => state.favorites.includes(id);

  const refreshCollections = useCallback(async () => {
    if (!state.user) return;
    try {
      const res = await apiGetCollections();
      const mapped: Collection[] = res.collections.map(c => ({
        id: c._id,
        name: c.name,
        description: c.description || '',
        color: c.color || '#6366f1',
        items: c.items || [],
        createdAt: c.createdAt
      }));
      dispatch({ type: 'SET_COLLECTIONS', payload: mapped });
    } catch (err) {
      console.error('Failed to fetch collections', err);
    }
  }, [state.user]);

  const addCollection = async (col: Omit<Collection, 'id' | 'createdAt'>) => {
    try {
      const res = await apiCreateCollection(col);
      dispatch({
        type: 'ADD_COLLECTION',
        payload: { ...res.collection, id: res.collection._id },
      });
    } catch (err) {
      console.error('Failed to create collection', err);
    }
  };

  const deleteCollection = async (id: string) => {
    try {
      await apiDeleteCollection(id);
      dispatch({ type: 'DELETE_COLLECTION', payload: id });
    } catch (err) {
      console.error('Failed to delete collection', err);
    }
  };

  const updateCollection = async (id: string, updates: Partial<Collection>) => {
    try {
      const res = await apiUpdateCollection(id, updates);
      dispatch({ type: 'UPDATE_COLLECTION', payload: { id, updates: { ...res.collection, id: res.collection._id } } });
    } catch (err) {
      console.error('Failed to update collection', err);
    }
  };

  const addToCollection = async (collectionId: string, productId: string) => {
    try {
      await apiAddItemToCollection(collectionId, productId);
      dispatch({ type: 'ADD_TO_COLLECTION', payload: { collectionId, productId } });
    } catch (err) {
      console.error('Failed to add to collection', err);
    }
  };

  const addTicket = async (ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'replies'>) => {
    try {
      const res = await apiCreateSupportTicket(ticketData);
      const ticket = {
        ...res.ticket,
        id: res.ticket._id,
        replies: res.ticket.replies.map((r: any) => ({
          author: r.sender,
          message: r.message,
          timestamp: r.createdAt
        }))
      };
      dispatch({ type: 'ADD_TICKET', payload: ticket });
    } catch (err) {
      console.error('Failed to add ticket', err);
    }
  };

  const refreshTickets = useCallback(async () => {
    if (!state.user) return;
    try {
      const res = await apiGetMyTickets();
      const mapped: SupportTicket[] = res.tickets.map((t: any) => ({
        ...t,
        id: t._id,
        replies: (t.replies || []).map((r: any) => ({
          author: r.sender,
          message: r.message,
          timestamp: r.createdAt
        }))
      }));
      dispatch({ type: 'SET_TICKETS', payload: mapped });
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    }
  }, [state.user]);

  const toggleSidebar = () => dispatch({ type: 'TOGGLE_SIDEBAR' });

  const downloadData = () => {
    const data = { user: state.user, favorites: state.favorites, collections: state.collections };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'jmlmaroc_data.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const refreshNotifications = useCallback(async () => {
    if (!state.user) return;
    try {
      const res = await apiGetNotifications();
      dispatch({ type: 'SET_NOTIFICATIONS', payload: res.notifications });
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  }, [state.user]);

  const markNotificationRead = async (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
    try { await apiMarkNotificationRead(id); } catch { /* ignore */ }
  };

  const markAllNotificationsRead = async () => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
    try { await apiMarkAllNotificationsRead(); } catch { /* ignore */ }
  };

  useEffect(() => {
    if (state.user) {
      refreshNotifications();
      refreshTickets();
      refreshCollections();
      // Poll every 60 seconds
      const interval = setInterval(() => {
        refreshNotifications();
        refreshTickets();
        refreshCollections();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [state.user, refreshNotifications, refreshTickets, refreshCollections]);

  const setLanguage = (lang: string) => {
    localStorage.setItem('jmlmaroc_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    dispatch({ type: 'SET_LANGUAGE', payload: lang });
  };

  return (
    <AppContext.Provider value={{
      ...state, login, loginWithGoogle, register, logout, updateUser, deleteAccount,
      addFavorite, removeFavorite, isFavorite, addCollection, deleteCollection,
      updateCollection, addToCollection, addTicket, toggleSidebar, downloadData,
      refreshNotifications, refreshTickets, refreshCollections, markNotificationRead, markAllNotificationsRead,
      setLanguage
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
