import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, Heart, ImageIcon, MessageSquare, LogOut, Clock, Calendar as CalendarIcon } from 'lucide-react';
import Logo from './Logo';
import Chat from './Chat';
import MoodCheckin from './MoodCheckin';
import MemoriesFeed from './MemoriesFeed';
import DailyPrompts from './DailyPrompts';
import Calendar from './Calendar';
import PendingPartner from './PendingPartner';

type Tab = 'chat' | 'mood' | 'memories' | 'prompts' | 'calendar';

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
    <div className="min-h-screen bg-brand-light">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Logo size="sm" showText={true} textStyle="horizontal" />
            <button
              onClick={signOut}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm bg-white/60 rounded-2xl p-4 border border-brand-blush/30">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-coral" />
              <div>
                <p className="text-xs text-gray-500">You</p>
                <p className="font-medium text-gray-800">
                  {getTimeInTimezone(profile?.timezone || 'UTC')}
                </p>
              </div>
            </div>
            {partner && (
              <>
                <div className="w-px h-8 bg-brand-blush"></div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-coral" />
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

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {!partner ? (
          <PendingPartner />
        ) : (
          <>
            {activeTab === 'chat' && <Chat />}
            {activeTab === 'mood' && <MoodCheckin />}
            {activeTab === 'memories' && <MemoriesFeed />}
            {activeTab === 'prompts' && <DailyPrompts />}
            {activeTab === 'calendar' && <Calendar />}
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-brand-blush/30 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-around">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                activeTab === 'chat'
                  ? 'bg-brand-coral text-white shadow-md'
                  : 'text-gray-600 hover:bg-brand-light'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs font-medium">Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('mood')}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                activeTab === 'mood'
                  ? 'bg-brand-coral text-white shadow-md'
                  : 'text-gray-600 hover:bg-brand-light'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span className="text-xs font-medium">Mood</span>
            </button>
            <button
              onClick={() => setActiveTab('memories')}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                activeTab === 'memories'
                  ? 'bg-brand-coral text-white shadow-md'
                  : 'text-gray-600 hover:bg-brand-light'
              }`}
            >
              <ImageIcon className="w-5 h-5" />
              <span className="text-xs font-medium">Memories</span>
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                activeTab === 'prompts'
                  ? 'bg-brand-coral text-white shadow-md'
                  : 'text-gray-600 hover:bg-brand-light'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs font-medium">Prompts</span>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                activeTab === 'calendar'
                  ? 'bg-brand-coral text-white shadow-md'
                  : 'text-gray-600 hover:bg-brand-light'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
              <span className="text-xs font-medium">Calendar</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
