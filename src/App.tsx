import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import PartnerSetup from './components/PartnerSetup';
import MainApp from './components/MainApp';
import DemoMode from './components/DemoMode';

function AppContent() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { user, profile, partner, loading } = useAuth();

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

  if (!partner) {
    return <PartnerSetup />;
  }

  return <MainApp />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
