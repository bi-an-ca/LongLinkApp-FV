import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Auth from './components/Auth';
import PartnerSetup from './components/PartnerSetup';
import MainApp from './components/MainApp';
import DemoMode from './components/DemoMode';

function AppContent() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { user, profile, partner, loading } = useAuth();

  // Debug logging
  useEffect(() => {
    console.log('AppContent state:', {
      hasUser: !!user,
      hasProfile: !!profile,
      hasPartner: !!partner,
      loading,
      userId: user?.id,
      profileId: profile?.id
    });
  }, [user, profile, partner, loading]);

  if (isDemoMode) {
    return <DemoMode onExit={() => setIsDemoMode(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-coral rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Auth onDemoMode={() => setIsDemoMode(true)} />;
  }

  return <MainApp />;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#333',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              },
              success: {
                iconTheme: {
                  primary: '#f97316',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
