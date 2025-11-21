import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from './types';
import { signInWithEmail, logout as authLogout, getUserProfile } from './lib/auth';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  reloadUser: () => void;
  updateUserInContext: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            const profile = await getUserProfile(firebaseUser.uid);
            setUser(profile);
        } else {
            setUser(null);
        }
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { user: loggedInUser, error } = await signInWithEmail(email, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      return { success: true };
    }
    return { success: false, error: error || 'An unknown error occurred.' };
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };
  
  const reloadUser = async () => {
    if (auth.currentUser) {
        const profile = await getUserProfile(auth.currentUser.uid);
        setUser(profile);
    }
  }

  const updateUserInContext = (updatedUser: User) => {
    setUser(updatedUser);
  }

  const value = { user, isLoading, login, logout, reloadUser, updateUserInContext };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};