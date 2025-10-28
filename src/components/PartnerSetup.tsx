import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Users, Copy, Check } from 'lucide-react';

export default function PartnerSetup() {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { linkPartner, profile } = useAuth();

  const handleLinkPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await linkPartner(inviteCode);
    } catch (err: any) {
      setError(err.message || 'Could not link partner');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = async () => {
    if (profile?.invite_code) {
      await navigator.clipboard.writeText(profile.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-coral rounded-full mb-4 shadow-lg">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Connect with Your Partner</h1>
          <p className="text-gray-600">
            Welcome, {profile?.display_name}! Share your invite code or enter theirs to link your accounts.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 mb-3">Your Invite Code</p>
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="bg-brand-light px-6 py-4 rounded-xl">
                <span className="text-3xl font-bold text-brand-coral tracking-wider">
                  {profile?.invite_code || 'LOADING'}
                </span>
              </div>
              <button
                onClick={copyInviteCode}
                className="p-3 hover:bg-brand-light rounded-xl transition-colors"
                title="Copy invite code"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5 text-brand-coral" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Share this code with your partner
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <form onSubmit={handleLinkPartner} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partner's Invite Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                required
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-brand-blush/30 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none transition-all bg-white text-center text-2xl font-bold tracking-wider"
                placeholder="ABC123"
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter the 6-character code from your partner
              </p>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || inviteCode.length !== 6}
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
