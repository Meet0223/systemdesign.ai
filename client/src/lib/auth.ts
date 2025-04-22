import { createContext, useContext } from 'react';

export interface AuthUser {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Function to get Auth0 login URL
export const getLoginUrl = () => {
  return `/api/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`;
};

// Function to get Auth0 logout URL
export const getLogoutUrl = () => {
  return `/api/auth/logout?returnTo=${encodeURIComponent(window.location.origin)}`;
};

// Function to fetch the current user from the backend
export const fetchUser = async (): Promise<AuthUser | null> => {
  try {
    const response = await fetch('/api/me');
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};