import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ErrorBoundary from './ErrorBoundary';
import { initializeDefaultAdmin } from './lib/auth';
import { migrateLocalStorage } from './lib/migration';
import { cleanupLocalStorage } from './lib/storage-cleanup';

// Run initial setup tasks on app load
initializeDefaultAdmin();
migrateLocalStorage();

// FIX: Refactored to a const with an explicit React.FC type to resolve a potential type inference issue.
const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Schedule a daily cleanup of old records from localStorage
    const cleanupInterval = setInterval(() => {
        cleanupLocalStorage();
    }, 1000 * 60 * 60 * 24); // Run once a day

    return () => clearInterval(cleanupInterval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="animate-pulse text-lg font-semibold text-mk-gray-dark">Loading Account...</div>
      </div>
    );
  }

  return user ? <Dashboard /> : <Auth />;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
