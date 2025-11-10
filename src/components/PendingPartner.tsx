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
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <p className="text-sm font-medium text-gray-700 mb-2 text-center">Your Invite Code</p>
        <div className="flex items-center justify-center gap-2">
          <div className="bg-brand-light px-4 py-2 rounded-xl">
            <span className="text-2xl font-bold text-brand-coral tracking-wider">
              {profile?.invite_code || 'LOADING'}
            </span>
          </div>
          <button
            onClick={copyInviteCode}
            className="p-2 hover:bg-brand-light rounded-xl transition-colors"
            title="Copy invite code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-brand-coral" />
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleLinkPartner} className="space-y-3">
        <div>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="w-full px-4 py-2 rounded-xl border border-brand-blush/30 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none transition-all bg-white text-center text-xl font-bold tracking-wider"
            placeholder="Enter partner's code"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-2 rounded-lg">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || inviteCode.length !== 6}
          className="w-full bg-brand-coral text-white py-2 rounded-xl font-medium hover:bg-brand-coral/90 transition-all disabled:opacity-50 shadow-md flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            'Connecting...'
          ) : (
            <>
              <Heart className="w-4 h-4 fill-white" />
              Link Partner
            </>
          )}
        </button>
      </form>
    </div>
  );
}
