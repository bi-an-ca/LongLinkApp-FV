import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Users } from 'lucide-react';

export default function PartnerSetup() {
  const [partnerEmail, setPartnerEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { linkPartner, profile } = useAuth();

  const handleLinkPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await linkPartner(partnerEmail);
    } catch (err: any) {
      setError(err.message || 'Could not link partner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br brand-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br brand-coral rounded-full mb-4 shadow-lg">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Connect with Your Partner</h1>
          <p className="text-gray-600">
            Welcome, {profile?.display_name}! Enter your partner's email to link your accounts.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <form onSubmit={handleLinkPartner} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partner's Email
              </label>
              <input
                type="email"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none transition-all"
                placeholder="partner@example.com"
              />
              <p className="text-xs text-gray-500 mt-2">
                Your partner needs to have created an account first
              </p>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-coral text-white py-3 rounded-xl font-medium hover:bg-brand-coral/90 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                'Connecting...'
              ) : (
                <>
                  <Heart className="w-5 h-5 fill-white" />
                  Link Accounts
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
