import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Copy, Check, UserPlus } from 'lucide-react';

export default function PendingPartner() {
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-coral/10 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-brand-coral" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Partner Linked Yet</h2>
          <p className="text-gray-600">
            Share your invite code with your partner or enter theirs to get started
          </p>
        </div>

        <div className="bg-brand-light rounded-2xl p-6 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3 text-center">Your Invite Code</p>
          <div className="flex items-center justify-center gap-3">
            <div className="bg-white px-6 py-4 rounded-xl shadow-sm">
              <span className="text-3xl font-bold text-brand-coral tracking-wider">
                {profile?.invite_code || 'LOADING'}
              </span>
            </div>
            <button
              onClick={copyInviteCode}
              className="p-3 hover:bg-white rounded-xl transition-colors"
              title="Copy invite code"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5 text-brand-coral" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Share this code with your partner
          </p>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or enter their code</span>
          </div>
        </div>

        <form onSubmit={handleLinkPartner} className="space-y-4">
          <div>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl border border-brand-blush/30 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none transition-all bg-white text-center text-2xl font-bold tracking-wider"
              placeholder="ABC123"
            />
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
                Link Partner
              </>
            )}
          </button>
        </form>
      </div>

      <div className="bg-white/50 rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-600 mb-2">
          You can still use the app while waiting for your partner to join!
        </p>
        <p className="text-xs text-gray-500">
          Features will be fully unlocked once you're both connected
        </p>
      </div>
    </div>
  );
}
