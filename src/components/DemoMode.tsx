import { useState, useEffect } from 'react';
import { MessageCircle, Heart, ImageIcon, MessageSquare, ArrowLeft, Clock, Send, Smile, Plus, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, X, Bell, Flame, Trophy, User, LogOut } from 'lucide-react';
import Logo from './Logo';

type Tab = 'chat' | 'mood' | 'memories' | 'prompts' | 'calendar';

const MOODS = [
  { emoji: '😊', label: 'Happy', color: 'from-yellow-200 to-amber-200' },
  { emoji: '🥰', label: 'Loved', color: 'from-pink-200 to-rose-200' },
  { emoji: '😌', label: 'Peaceful', color: 'from-blue-200 to-cyan-200' },
  { emoji: '😴', label: 'Tired', color: 'from-purple-200 to-indigo-200' },
  { emoji: '😔', label: 'Sad', color: 'from-gray-200 to-slate-200' },
  { emoji: '😰', label: 'Stressed', color: 'from-orange-200 to-red-200' },
  { emoji: '😤', label: 'Frustrated', color: 'from-red-200 to-pink-200' },
  { emoji: '🤗', label: 'Grateful', color: 'from-green-200 to-emerald-200' },
];

const EMOJI_REACTIONS = ['❤️', '😊', '😂', '🥰', '😢', '👍'];

const DEMO_MESSAGES = [
  { id: '1', content: 'Good morning! How did you sleep?', isMine: false, time: '8:30 AM', date: 'Today', reaction: '❤️', status: 'read' },
  { id: '2', content: 'Morning love! Pretty well, dreamt about our next trip together', isMine: true, time: '8:45 AM', date: 'Today', reaction: '🥰', status: 'read' },
  { id: '3', content: 'Aww that sounds amazing! Where should we go?', isMine: false, time: '8:47 AM', date: 'Today', reaction: '', status: 'read' },
  { id: '4', content: 'Maybe somewhere by the beach? We could watch the sunset together', isMine: true, time: '8:50 AM', date: 'Today', reaction: '😊', status: 'read' },
  { id: '5', content: 'I love that idea! Just 45 more days until we meet', isMine: false, time: '8:52 AM', date: 'Today', reaction: '', status: 'read' },
  { id: '6', content: 'Goodnight! Sweet dreams 💕', isMine: false, time: '11:30 PM', date: 'Yesterday', reaction: '❤️', status: 'read' },
  { id: '7', content: 'Goodnight beautiful! Talk tomorrow', isMine: true, time: '11:35 PM', date: 'Yesterday', reaction: '', status: 'read' },
];

const DEMO_MEMORIES = [
  {
    id: '1',
    author: 'You',
    content: 'Missing these sunset walks together. Can\'t wait until we can do this again!',
    date: '2 days ago',
    isMine: true,
  },
  {
    id: '2',
    author: 'Alex',
    content: 'Found this old photo of us from our first date. Remember how nervous we both were? Best decision I ever made.',
    date: '5 days ago',
    isMine: false,
  },
  {
    id: '3',
    author: 'You',
    content: 'Just had the best video call with you. Your laugh always makes my day brighter, no matter the distance.',
    date: '1 week ago',
    isMine: true,
  },
];

const DEMO_EVENTS = [
  { id: '1', title: 'Next Reunion!', date: new Date(2025, 11, 15), type: 'reunion', location: 'Paris, France', time: '3:00 PM', description: 'Finally meeting after 3 months! Flight lands at CDG.' },
  { id: '2', title: 'Our Anniversary', date: new Date(2025, 11, 1), type: 'anniversary', location: '', time: '', description: '2 years together!' },
  { id: '3', title: 'Alex\'s Birthday', date: new Date(2025, 10, 25), type: 'birthday', location: '', time: '12:00 PM', description: 'Don\'t forget to call!' },
  { id: '4', title: 'Send Care Package', date: new Date(2025, 10, 20), type: 'reminder', location: '', time: '', description: 'Mail the care package so it arrives on time' },
  { id: '5', title: 'Video Call Date Night', date: new Date(2025, 10, 28), type: 'other', location: '', time: '8:00 PM', description: 'Movie night together over video call' },
];

export default function DemoMode({ onExit }: { onExit: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [newMessage, setNewMessage] = useState('');
  const [selectedMood, setSelectedMood] = useState('Loved');
  const [moodNote, setMoodNote] = useState('Feeling grateful for our connection today');
  const [promptResponse, setPromptResponse] = useState('You always know how to make me smile, even from thousands of miles away');
  const [showCreateMemory, setShowCreateMemory] = useState(false);
  const [newMemory, setNewMemory] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getTimeInTimezone = (timezone: string) => {
    try {
      return currentTime.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'N/A';
    }
  };

  const renderChat = () => {
    const [partnerTyping] = useState(false);
    const [unreadCount] = useState(2);
    
    const formatLastSeen = () => {
      return '5 minutes ago';
    };
    
    return (
      <div className="bg-white rounded-3xl shadow-xl h-[calc(100vh-280px)] flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Chat with Alex</h2>
              <p className="text-xs text-gray-500 mt-1">
                Last seen {formatLastSeen()}
              </p>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {DEMO_MESSAGES.map((message, index) => {
            const prevMessage = index > 0 ? DEMO_MESSAGES[index - 1] : null;
            const showDateHeader = !prevMessage || message.date !== prevMessage.date;
            
            const formatTimestamp = (date: string) => {
              if (date === 'Today') return 'Today';
              if (date === 'Yesterday') return 'Yesterday';
              return date;
            };
            
            return (
              <div key={message.id}>
                {showDateHeader && (
                  <div className="text-center my-4">
                    <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full">
                      {formatTimestamp(message.date)}
                    </span>
                  </div>
                )}
                <div className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md group`}>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        message.isMine
                          ? 'bg-gradient-to-br from-brand-coral to-pink-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-2">
                      {message.reaction && <span className="text-lg">{message.reaction}</span>}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        {EMOJI_REACTIONS.map((emoji) => (
                          <button key={emoji} className="hover:scale-125 transition-transform text-sm">
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <span className="text-xs text-gray-400">{message.time}</span>
                        {message.isMine && (
                          <span className="text-xs text-gray-400" title={message.status || 'sent'}>
                            {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓✓' : message.status === 'sent' ? '✓' : '○'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {partnerTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
        </div>

      <form onSubmit={(e) => { e.preventDefault(); }} className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Add emoji"
          >
            <Smile className="w-6 h-6 text-gray-400" />
          </button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="demo-chat-image-input"
          />
          <label
            htmlFor="demo-chat-image-input"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            title="Add image"
          >
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </label>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-gradient-to-br from-brand-coral to-pink-500 text-white rounded-full hover:from-pink-500 hover:to-rose-500 transition-all disabled:opacity-50"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
  };

  const renderMood = () => {
    const currentStreak = 12;
    const longestStreak = 15;
    
    return (
      <div className="space-y-6 pb-20">
        {/* Streak Display */}
        {(currentStreak > 0 || longestStreak > 0) && (
          <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-3xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flame className="w-8 h-8 fill-white" />
                <div>
                  <p className="text-sm opacity-90">Current Streak</p>
                  <p className="text-3xl font-bold">{currentStreak} days</p>
                </div>
              </div>
              {longestStreak > currentStreak && (
                <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
                  <Trophy className="w-5 h-5" />
                  <div>
                    <p className="text-xs opacity-90">Best</p>
                    <p className="text-lg font-bold">{longestStreak} days</p>
                  </div>
                </div>
              )}
            </div>
            {currentStreak >= 7 && (
              <p className="text-sm mt-3 opacity-90">🔥 Keep it up! You're on fire!</p>
            )}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">How are you feeling today?</h2>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {MOODS.map((mood) => (
            <button
              key={mood.label}
              onClick={() => setSelectedMood(mood.label)}
              className={`p-4 rounded-2xl transition-all ${
                selectedMood === mood.label
                  ? `bg-gradient-to-br ${mood.color} scale-105 shadow-lg`
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="text-3xl mb-1">{mood.emoji}</div>
              <div className="text-xs font-medium text-gray-700">{mood.label}</div>
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add a note (optional)
          </label>
          <textarea
            value={moodNote}
            onChange={(e) => setMoodNote(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none resize-none"
          />
        </div>

        <button
          disabled={!selectedMood}
          className="w-full bg-gradient-to-r from-brand-coral to-pink-500 text-white py-3 rounded-xl font-medium hover:from-pink-500 hover:to-rose-500 transition-all disabled:opacity-50 shadow-lg"
        >
          Update Mood
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Alex's mood today</h3>

        <div className="inline-flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-yellow-200 to-amber-200">
          <span className="text-4xl">😊</span>
          <div>
            <p className="font-semibold text-gray-800">Happy</p>
            <p className="text-sm text-gray-600 mt-1">Can't wait to talk to you tonight!</p>
          </div>
        </div>
      </div>
    </div>
    );
  };

  const renderMemories = () => (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Our Memories</h2>
        <button
          onClick={() => setShowCreateMemory(!showCreateMemory)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-coral to-pink-500 text-white rounded-full hover:from-pink-500 hover:to-rose-500 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">Add Memory</span>
        </button>
      </div>

      {showCreateMemory && (
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Create a New Memory</h3>
          
          <textarea
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            placeholder="Share a moment, thought, or memory..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none resize-none mb-4"
          />
          
          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="demo-memory-image-input"
            />
            <label
              htmlFor="demo-memory-image-input"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors text-sm text-gray-700"
            >
              <ImageIcon className="w-4 h-4" />
              Add Photo
            </label>
          </div>

          <div className="flex gap-2">
            <button
              disabled={!newMemory.trim()}
              className="flex-1 bg-gradient-to-r from-brand-coral to-pink-500 text-white py-2 rounded-xl font-medium hover:from-pink-500 hover:to-rose-500 transition-all disabled:opacity-50"
            >
              Save Memory
            </button>
            <button
              onClick={() => {
                setShowCreateMemory(false);
                setNewMemory('');
              }}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {DEMO_MEMORIES.map((memory) => (
          <div key={memory.id} className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-coral to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {memory.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{memory.author}</p>
                  <p className="text-xs text-gray-500">{memory.date}</p>
                </div>
              </div>
              {memory.isMine && (
                <button className="p-2 hover:bg-red-50 rounded-full transition-colors group">
                  <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                </button>
              )}
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{memory.content}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrompts = () => (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-br brand-light to-white rounded-3xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-brand-coral500" />
          </div>
          <div>
            <p className="text-sm text-brand-coral700 font-medium">Today's Prompt</p>
            <p className="text-xs text-brand-coral600">
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 leading-relaxed">
          What is one thing you appreciated about today?
        </h2>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Response</h3>
        <textarea
          value={promptResponse}
          onChange={(e) => setPromptResponse(e.target.value)}
          placeholder="Share your thoughts..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-coral/30 focus:border-transparent outline-none resize-none mb-4"
        />
        <button
          onClick={() => {}}
          disabled={!promptResponse.trim()}
          className="w-full bg-gradient-to-r from-brand-coral to-pink-500 text-white py-3 rounded-xl font-medium hover:from-pink-500 hover:to-rose-500 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          Update Response
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-coral to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
            A
          </div>
          <div>
            <p className="font-semibold text-gray-800">Alex's Response</p>
            <p className="text-xs text-gray-500">Today at 2:30 PM</p>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-xl">
          Getting to video call with you this morning. Even though we're far apart, moments like these make everything worth it.
        </p>
      </div>
    </div>
  );

  const renderCalendar = () => {
    const getDaysInMonth = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const days = [];
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
      }
      return days;
    };

    const getEventsForDate = (date: Date | null) => {
      if (!date) return [];
      return DEMO_EVENTS.filter(event =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
      );
    };

    const getNextReunion = () => {
      const now = new Date();
      const reunionEvents = DEMO_EVENTS.filter(
        event => event.type === 'reunion' && event.date >= now
      );
      return reunionEvents.sort((a, b) => a.date.getTime() - b.date.getTime())[0];
    };

    const getDaysUntil = (date: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

    const nextReunion = getNextReunion();
    const days = getDaysInMonth();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const eventTypeColors: Record<string, string> = {
      reunion: 'bg-brand-coral text-white',
      reminder: 'bg-blue-500 text-white',
      anniversary: 'bg-pink-500 text-white',
      birthday: 'bg-purple-500 text-white',
      other: 'bg-gray-500 text-white',
    };

    return (
      <div className="space-y-6 pb-20">
        {nextReunion && (
          <div className="bg-gradient-to-br from-brand-coral to-pink-500 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Next Reunion</p>
                <h3 className="text-2xl font-bold mb-2">{nextReunion.title}</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {nextReunion.date.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  {nextReunion.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {nextReunion.location}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-1">
                  {getDaysUntil(nextReunion.date)}
                </div>
                <div className="text-sm opacity-90">days</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="p-2 hover:bg-brand-light rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm font-medium text-brand-coral hover:bg-brand-light rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="p-2 hover:bg-brand-light rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
              <button className="ml-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-coral to-pink-500 text-white rounded-xl hover:from-pink-500 hover:to-rose-500 transition-all shadow-md">
                <Plus className="w-5 h-5" />
                Add Event
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            {days.map((day, index) => {
              const dayEvents = getEventsForDate(day);
              const isToday = day && day.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`min-h-24 p-2 border border-gray-100 rounded-xl cursor-pointer transition-all hover:border-brand-coral hover:bg-brand-light/30 ${
                    !day ? 'bg-gray-50' : ''
                  } ${isToday ? 'border-brand-coral border-2 bg-brand-light/50' : ''}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-brand-coral' : 'text-gray-700'}`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`text-xs px-2 py-1 rounded truncate ${
                              eventTypeColors[event.type]
                            }`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500 px-2">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {DEMO_EVENTS.sort((a, b) => a.date.getTime() - b.date.getTime()).map(event => (
              <div key={event.id} className="flex items-start gap-3 p-4 bg-brand-light rounded-xl hover:bg-brand-light/70 transition-colors">
                <div className={`p-2 rounded-lg ${eventTypeColors[event.type]}`}>
                  {event.type === 'reunion' ? <Heart className="w-5 h-5" /> :
                   event.type === 'reminder' ? <Bell className="w-5 h-5" /> :
                   event.type === 'anniversary' ? <Heart className="w-5 h-5" /> :
                   <CalendarIcon className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{event.title}</h4>
                  <div className="text-sm text-gray-600 mt-1">
                    {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {event.time && ` at ${event.time}`}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </div>
                  )}
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    const demoMilestones = [
      { id: '1', title: 'First Message', description: 'The beginning of your conversation', date: '3 months ago', type: 'first_message', daysSince: 90 },
      { id: '2', title: 'Our Anniversary', description: '2 years together!', date: '2 months ago', type: 'anniversary', daysSince: 60 },
    ];

    return (
      <div className="space-y-6 pb-20">
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-coral to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              Y
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">You</h2>
              <p className="text-gray-500 text-sm mt-1">you@example.com</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Timezone</p>
              <p className="font-medium text-gray-800">America/New_York</p>
            </div>
            <div>
              <p className="text-gray-500">Member Since</p>
              <p className="font-medium text-gray-800">Oct 2024</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-3xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 fill-white" />
              <div>
                <p className="text-sm opacity-90">Current Streak</p>
                <p className="text-3xl font-bold">12 days</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
              <Trophy className="w-5 h-5" />
              <div>
                <p className="text-xs opacity-90">Best</p>
                <p className="text-lg font-bold">15 days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Milestones</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-coral to-pink-500 text-white rounded-full hover:from-pink-500 hover:to-rose-500 transition-all shadow-lg text-sm">
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          <div className="space-y-4">
            {demoMilestones.map((milestone) => (
              <div key={milestone.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-coral to-pink-500 rounded-full flex items-center justify-center text-2xl">
                  {milestone.type === 'first_message' ? '💬' : '💍'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{milestone.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <CalendarIcon className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{milestone.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-light">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <Logo size="sm" showText={true} textStyle="horizontal" />
              <div className="flex items-center gap-2 mt-1">
                <Heart className="w-3 h-3 text-brand-coral fill-brand-coral" />
                <p className="text-xs font-medium text-brand-coral">
                  Linked with <span className="font-semibold">Alex</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {/* Profile view not available in demo */}}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                title="Profile (not available in demo)"
                aria-label="Profile"
              >
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={onExit}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Exit Demo"
                aria-label="Exit Demo"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm bg-white/60 rounded-2xl p-4 border border-brand-blush/30">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-coral" />
              <div>
                <p className="text-xs text-gray-500">You</p>
                <p className="font-medium text-gray-800">
                  {getTimeInTimezone('America/New_York')}
                </p>
              </div>
            </div>
            <div className="w-px h-8 bg-brand-blush"></div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-coral" />
              <div>
                <p className="text-xs text-gray-500">Alex</p>
                <p className="font-medium text-gray-800">
                  {getTimeInTimezone('America/Los_Angeles')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {activeTab === 'chat' && renderChat()}
        {activeTab === 'mood' && renderMood()}
        {activeTab === 'memories' && renderMemories()}
        {activeTab === 'prompts' && renderPrompts()}
        {activeTab === 'calendar' && renderCalendar()}
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
              aria-label="Chat"
              aria-pressed={activeTab === 'chat'}
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
              aria-label="Mood Check-in"
              aria-pressed={activeTab === 'mood'}
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
              aria-label="Memories"
              aria-pressed={activeTab === 'memories'}
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
              aria-label="Daily Prompts"
              aria-pressed={activeTab === 'prompts'}
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
              aria-label="Calendar"
              aria-pressed={activeTab === 'calendar'}
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
