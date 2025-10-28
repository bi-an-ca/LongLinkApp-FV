import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, Heart, ImageIcon, MessageSquare, LogOut, Clock } from 'lucide-react';
import Chat from './Chat';
import MoodCheckin from './MoodCheckin';
import MemoriesFeed from './MemoriesFeed';
import DailyPrompts from './DailyPrompts';

type Tab = 'chat' | 'mood' | 'memories' | 'prompts';

export default function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const { profile, partner, signOut } = useAuth();

  const getTimeInTimezone = (timezone: string) => {
    try {
      return new Date().toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">LongLink</h1>
                <p className="text-xs text-gray-500">Love that travels with you</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-500" />
              <div>
                <p className="text-xs text-gray-500">You</p>
                <p className="font-medium text-gray-800">
                  {getTimeInTimezone(profile?.timezone || 'UTC')}
                </p>
              </div>
            </div>
            {partner && (
              <>
                <div className="w-px h-8 bg-pink-200"></div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-500" />
                  <div>
                    <p className="text-xs text-gray-500">{partner.display_name}</p>
                    <p className="font-medium text-gray-800">
                      {getTimeInTimezone(partner.timezone || 'UTC')}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'chat' && <Chat />}
        {activeTab === 'mood' && <MoodCheckin />}
        {activeTab === 'memories' && <MemoriesFeed />}
        {activeTab === 'prompts' && <DailyPrompts />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-around">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-br from-pink-400 to-rose-400 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs font-medium">Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('mood')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'mood'
                  ? 'bg-gradient-to-br from-pink-400 to-rose-400 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Heart className="w-6 h-6" />
              <span className="text-xs font-medium">Mood</span>
            </button>
            <button
              onClick={() => setActiveTab('memories')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'memories'
                  ? 'bg-gradient-to-br from-pink-400 to-rose-400 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ImageIcon className="w-6 h-6" />
              <span className="text-xs font-medium">Memories</span>
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'prompts'
                  ? 'bg-gradient-to-br from-pink-400 to-rose-400 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="w-6 h-6" />
              <span className="text-xs font-medium">Prompts</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
