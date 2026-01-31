/**
 * Authentication Context
 * Manages user session state and provides auth utilities
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthSession {
  username: string;
  loginTime: number;
  expiresAt: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthSession | null;
  login: (username: string) => void;
  logout: () => void;
  checkSession: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'matsu_auth';
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const stored = sessionStorage.getItem(SESSION_KEY);
        if (stored) {
          const session: AuthSession = JSON.parse(stored);
          
          // Check if session is still valid
          if (session.expiresAt > Date.now()) {
            setUser(session);
            setIsAuthenticated(true);
            return;
          } else {
            // Session expired, clear it
            sessionStorage.removeItem(SESSION_KEY);
          }
        }
      } catch (e) {
        console.error('Failed to parse auth session:', e);
        sessionStorage.removeItem(SESSION_KEY);
      }
      
      setUser(null);
      setIsAuthenticated(false);
    };

    checkExistingSession();

    // Check session validity every minute
    const interval = setInterval(checkExistingSession, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const login = (username: string) => {
    const session: AuthSession = {
      username,
      loginTime: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION
    };
    
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
    setIsAuthenticated(false);
  };

  const checkSession = (): boolean => {
    if (!user) return false;
    
    if (user.expiresAt <= Date.now()) {
      logout();
      return false;
    }
    
    // Extend session on activity
    const extendedSession: AuthSession = {
      ...user,
      expiresAt: Date.now() + SESSION_DURATION
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(extendedSession));
    setUser(extendedSession);
    
    return true;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
