import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye } from 'lucide-react';
import Logo from './Logo';

interface AuthProps {
  onDemoMode?: () => void;
}

export default function Auth({ onDemoMode }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Validate password length
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }

      if (isSignUp) {
        if (!displayName.trim()) {
          setError('Please enter a display name');
          setLoading(false);
          return;
        }
        await signUp(email.trim().toLowerCase(), password, displayName.trim(), timezone);
        setSuccessMessage('Account created! Please check your email to verify your account before signing in.');
        setEmail('');
        setPassword('');
        setDisplayName('');
        setIsSignUp(false);
      } else {
        await signIn(email.trim().toLowerCase(), password);
      }
    } catch (err: any) {
      // More detailed error messages
      console.error('Full authentication error object:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      
      let errorMessage = 'An error occurred. Please try again.';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.error?.message) {
        errorMessage = err.error.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Check for specific Supabase errors
      if (err.status === 400 || err.message?.includes('Invalid')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (err.message?.includes('rate limit')) {
        errorMessage = 'Too many attempts. Please wait a moment and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" showText={true} textStyle="vertical" />
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 px-4 rounded-full transition-all ${
                !isSignUp
                  ? 'bg-brand-coral text-white shadow-md'
                  : 'bg-white text-gray-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 px-4 rounded-full transition-all ${
                isSignUp
                  ? 'bg-brand-coral text-white shadow-md'
                  : 'bg-white text-gray-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          {!isSignUp && (
            <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <strong>Note:</strong> You must verify your email before signing in. Check your inbox for a confirmation link after signing up.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-brand-blush/30 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none transition-all bg-white"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-brand-blush/30 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none transition-all bg-white"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-brand-blush/30 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none transition-all bg-white"
                placeholder="••••••••"
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-brand-blush/30 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Anchorage">Alaska Time (AKT)</option>
                  <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Europe/Berlin">Berlin (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Asia/Shanghai">Shanghai (CST)</option>
                  <option value="Asia/Dubai">Dubai (GST)</option>
                  <option value="Australia/Sydney">Sydney (AEST)</option>
                  <option value="America/Sao_Paulo">São Paulo (BRT)</option>
                  <option value="America/Mexico_City">Mexico City (CST)</option>
                  <option value="America/Toronto">Toronto (ET)</option>
                  <option value="Europe/Moscow">Moscow (MSK)</option>
                  <option value="Asia/Kolkata">Mumbai (IST)</option>
                  <option value="Asia/Singapore">Singapore (SGT)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">We'll use this to show both your times</p>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
            )}

            {successMessage && (
              <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">{successMessage}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-coral text-white py-3 rounded-xl font-medium hover:bg-brand-coral/90 transition-all disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {onDemoMode && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={onDemoMode}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-brand-light text-brand-coral rounded-xl font-medium transition-all border-2 border-brand-coral"
              >
                <Eye className="w-5 h-5" />
                Try Demo Mode
              </button>
              <p className="text-xs text-center text-gray-500 mt-2">
                Explore the app without signing up
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
