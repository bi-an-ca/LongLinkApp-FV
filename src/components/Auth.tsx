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

  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, displayName, timezone);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:border-transparent outline-none transition-all"
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-brand-blush/30 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none transition-all bg-white"
                  placeholder="America/New_York"
                />
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
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
