import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  apiGetMe, apiLogin, apiRegister, apiGoogleAuth, apiGoogleAccess, apiUpdateProfile,
  apiAddFavorite, apiRemoveFavorite, apiDeleteAccount,
  apiGetNotifications, apiMarkNotificationRead, apiMarkAllNotificationsRead,
  apiGetMyTickets,
  ApiUser, ApiNotification
} from '../services/api';
import { Collection, SupportTicket } from '../data/mockData';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  authProvider: 'local' | 'google';
  role: 'buyer' | 'supplier' | 'admin';
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
  notifications: ApiNotification[];
  unreadNotifications: number;
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
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' };

const COLLECTIONS_KEY = 'choufliya_collections';
const TICKETS_KEY = 'choufliya_tickets';

const loadCollections = (): Collection[] => {
  try { return JSON.parse(localStorage.getItem(COLLECTIONS_KEY) || '[]'); } catch { return []; }
};
const loadTickets = (): SupportTicket[] => {
  try { return JSON.parse(localStorage.getItem(TICKETS_KEY) || '[]'); } catch { return []; }
};

const initialState: AppState = {
  user: null,
  isLoading: true,
  favorites: [],
  collections: loadCollections(),
  tickets: loadTickets(),
  sidebarCollapsed: false,
  isApiAvailable: false,
  notifications: [],
  unreadNotifications: 0,
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
  addCollection: (collection: Omit<Collection, 'id' | 'createdAt'>) => void;
  deleteCollection: (id: string) => void;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  addToCollection: (collectionId: string, productId: string) => void;
  addTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'replies'>) => void;
  toggleSidebar: () => void;
  downloadData: () => void;
  refreshNotifications: () => Promise<void>;
  refreshTickets: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // On mount: check JWT token → fetch user
  useEffect(() => {
    const token = localStorage.getItem('choufliya_token');
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
            localStorage.removeItem('choufliya_token');
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
        localStorage.removeItem('choufliya_token');
        dispatch({ type: 'SET_LOADING', payload: false });
      });
  }, []);

  // Persist collections & tickets to localStorage
  useEffect(() => {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(state.collections));
  }, [state.collections]);

  useEffect(() => {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(state.tickets));
  }, [state.tickets]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await apiLogin(email, password);
      localStorage.setItem('choufliya_token', res.token);
      dispatch({ type: 'LOGIN', payload: mapApiUser(res.user) });
      dispatch({ type: 'SET_API_STATUS', payload: true });
      return true;
    } catch {
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
      
      if (res.token) localStorage.setItem('choufliya_token', res.token);
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
      localStorage.setItem('choufliya_token', res.token);
      dispatch({ type: 'LOGIN', payload: mapApiUser(res.user) });
      dispatch({ type: 'SET_API_STATUS', payload: true });
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('choufliya_token');
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
    localStorage.removeItem('choufliya_token');
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

  const addCollection = (col: Omit<Collection, 'id' | 'createdAt'>) => {
    dispatch({
      type: 'ADD_COLLECTION',
      payload: { ...col, id: `col_${Date.now()}`, createdAt: new Date().toISOString() },
    });
  };

  const deleteCollection = (id: string) => dispatch({ type: 'DELETE_COLLECTION', payload: id });
  const updateCollection = (id: string, updates: Partial<Collection>) =>
    dispatch({ type: 'UPDATE_COLLECTION', payload: { id, updates } });
  const addToCollection = (collectionId: string, productId: string) =>
    dispatch({ type: 'ADD_TO_COLLECTION', payload: { collectionId, productId } });

  const addTicket = (ticket: SupportTicket) => {
    dispatch({ type: 'ADD_TICKET', payload: ticket });
  };

  const refreshTickets = useCallback(async () => {
    if (!state.user) return;
    try {
      const res = await apiGetMyTickets();
      dispatch({ type: 'SET_TICKETS', payload: res.tickets });
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
    a.href = url; a.download = 'choufliya_data.json'; a.click();
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
      // Poll every 60 seconds
      const interval = setInterval(() => {
        refreshNotifications();
        refreshTickets();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [state.user, refreshNotifications, refreshTickets]);

  return (
    <AppContext.Provider value={{
      ...state, login, loginWithGoogle, register, logout, updateUser, deleteAccount,
      addFavorite, removeFavorite, isFavorite, addCollection, deleteCollection,
      updateCollection, addToCollection, addTicket, toggleSidebar, downloadData,
      refreshNotifications, refreshTickets, markNotificationRead, markAllNotificationsRead,
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
