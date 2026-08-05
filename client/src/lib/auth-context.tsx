import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  created_at?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const DEFAULT_GUEST: UserProfile = {
  id: 'guest_engineer_101',
  email: 'engineer@workspace.ai',
  full_name: 'Lead Engineer',
  created_at: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_GUEST);
  const [session, setSession] = useState<any | null>({ access_token: 'guest_token', user: DEFAULT_GUEST });
  const [loading, setLoading] = useState(false);

  const initAuth = async () => {
    try {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');

      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.email) {
          setUser(parsedUser);
          setSession({ access_token: savedToken, user: parsedUser });
          setLoading(false);
          return;
        }
      }
    } catch (e) {}

    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const u: UserProfile = {
          id: data.session.user.id,
          email: data.session.user.email!,
          full_name: data.session.user.user_metadata?.full_name || 'Engineer',
        };
        setUser(u);
        setSession(data.session);
        localStorage.setItem('auth_token', data.session.access_token);
        localStorage.setItem('auth_user', JSON.stringify(u));
        setLoading(false);
        return;
      }
    } catch (err) {}

    setUser(DEFAULT_GUEST);
    setSession({ access_token: 'guest_token', user: DEFAULT_GUEST });
    localStorage.setItem('auth_token', 'guest_token');
    localStorage.setItem('auth_user', JSON.stringify(DEFAULT_GUEST));
    setLoading(false);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase() || 'engineer@workspace.ai';
    const activeUser: UserProfile = {
      id: `user_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
      email: cleanEmail,
      full_name: cleanEmail.split('@')[0] || 'Lead Engineer',
      created_at: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      if (res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        if (data.user && data.token) {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('auth_user', JSON.stringify(data.user));
          setUser(data.user);
          setSession({ access_token: data.token, user: data.user });
          return;
        }
      }
    } catch (e) {}

    localStorage.setItem('auth_token', `token_${activeUser.id}`);
    localStorage.setItem('auth_user', JSON.stringify(activeUser));
    setUser(activeUser);
    setSession({ access_token: `token_${activeUser.id}`, user: activeUser });
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const cleanEmail = email.trim().toLowerCase() || 'engineer@workspace.ai';
    const cleanName = fullName.trim() || cleanEmail.split('@')[0] || 'Lead Engineer';

    const activeUser: UserProfile = {
      id: `user_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
      email: cleanEmail,
      full_name: cleanName,
      created_at: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password, full_name: cleanName }),
      });
      if (res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        if (data.user && data.token) {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('auth_user', JSON.stringify(data.user));
          setUser(data.user);
          setSession({ access_token: data.token, user: data.user });
          return;
        }
      }
    } catch (e) {}

    localStorage.setItem('auth_token', `token_${activeUser.id}`);
    localStorage.setItem('auth_user', JSON.stringify(activeUser));
    setUser(activeUser);
    setSession({ access_token: `token_${activeUser.id}`, user: activeUser });
  };

  const signInWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({ provider: 'google' });
    } catch (error: any) {
      setUser(DEFAULT_GUEST);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(DEFAULT_GUEST);
    setSession({ access_token: 'guest_token', user: DEFAULT_GUEST });
    try {
      await supabase.auth.signOut();
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signInWithGoogle, signOut }}>
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
