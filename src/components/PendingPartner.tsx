import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Copy, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function PendingPartner() {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
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

  if (dismissed) return null;

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-r from-brand-coral to-pink-500 rounded-2xl shadow-lg text-white overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Heart className="w-5 h-5 fill-white" />
              <div className="flex-1">
                <h3 className="font-semibold">Partner Not Linked</h3>
                <p className="text-sm opacity-90">Link with your partner to unlock shared features</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                aria-label={expanded ? 'Collapse' : 'Expand'}
              >
                {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="bg-white text-gray-800 p-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Your Invite Code</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  <span className="text-2xl font-bold text-brand-coral tracking-wider">
                    {profile?.invite_code || 'LOADING'}
                  </span>
                </div>
                <button
                  onClick={copyInviteCode}
                  className="p-3 bg-brand-coral/10 hover:bg-brand-coral/20 rounded-xl transition-colors"
                  title="Copy invite code"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-brand-coral" />
                  )}
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or enter their code</span>
              </div>
            </div>

            <form onSubmit={handleLinkPartner} className="space-y-3">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none text-center text-xl font-bold tracking-wider"
                placeholder="ABC123"
              />

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading || inviteCode.length !== 6}
                className="w-full bg-brand-coral text-white py-3 rounded-xl font-medium hover:bg-brand-coral/90 transition-all disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
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
        )}
      </div>
    </div>
  );
}
