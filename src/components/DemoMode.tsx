import { useState } from 'react';
import { MessageCircle, Heart, ImageIcon, MessageSquare, ArrowLeft, Clock, Send, Smile, Plus, Trash2 } from 'lucide-react';

type Tab = 'chat' | 'mood' | 'memories' | 'prompts';

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
  { id: '1', content: 'Good morning! How did you sleep?', isMine: false, time: '8:30 AM', reaction: '❤️' },
  { id: '2', content: 'Morning love! Pretty well, dreamt about our next trip together', isMine: true, time: '8:45 AM', reaction: '🥰' },
  { id: '3', content: 'Aww that sounds amazing! Where should we go?', isMine: false, time: '8:47 AM', reaction: '' },
  { id: '4', content: 'Maybe somewhere by the beach? We could watch the sunset together', isMine: true, time: '8:50 AM', reaction: '😊' },
  { id: '5', content: 'I love that idea! Just 45 more days until we meet', isMine: false, time: '8:52 AM', reaction: '' },
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

export default function DemoMode({ onExit }: { onExit: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [newMessage, setNewMessage] = useState('');
  const [selectedMood, setSelectedMood] = useState('Loved');
  const [moodNote, setMoodNote] = useState('Feeling grateful for our connection today');
  const [promptResponse, setPromptResponse] = useState('You always know how to make me smile, even from thousands of miles away');
  const [showCreateMemory, setShowCreateMemory] = useState(false);
  const [newMemory, setNewMemory] = useState('');

  const renderChat = () => (
    <div className="bg-white rounded-3xl shadow-xl h-[calc(100vh-280px)] flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">Chat with Alex</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {DEMO_MESSAGES.map((message) => (
          <div key={message.id} className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-xs lg:max-w-md group">
              <div
                className={`rounded-2xl px-4 py-2 ${
                  message.isMine
                    ? 'bg-gradient-to-br from-pink-400 to-rose-400 text-white'
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
                <span className="text-xs text-gray-400 ml-auto">{message.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Add emoji">
            <Smile className="w-6 h-6 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Add image">
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:border-transparent outline-none"
          />
          <button className="p-2 bg-gradient-to-br from-pink-400 to-rose-400 text-white rounded-full hover:from-pink-500 hover:to-rose-500 transition-all">
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderMood = () => (
    <div className="space-y-6 pb-20">
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
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:border-transparent outline-none resize-none"
          />
        </div>

        <button className="w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white py-3 rounded-xl font-medium hover:from-pink-500 hover:to-rose-500 transition-all shadow-lg">
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

  const renderMemories = () => (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Our Memories</h2>
        <button
          onClick={() => setShowCreateMemory(!showCreateMemory)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full hover:from-pink-500 hover:to-rose-500 transition-all shadow-lg"
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
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:border-transparent outline-none resize-none mb-4"
          />
          <div className="flex gap-2">
            <button className="flex-1 bg-gradient-to-r from-pink-400 to-rose-400 text-white py-2 rounded-xl font-medium hover:from-pink-500 hover:to-rose-500 transition-all">
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
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white font-semibold">
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
      <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-pink-500" />
          </div>
          <div>
            <p className="text-sm text-pink-700 font-medium">Today's Prompt</p>
            <p className="text-xs text-pink-600">
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
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:border-transparent outline-none resize-none mb-4"
        />
        <button className="w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white py-3 rounded-xl font-medium hover:from-pink-500 hover:to-rose-500 transition-all shadow-lg flex items-center justify-center gap-2">
          <Send className="w-5 h-5" />
          Update Response
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white font-semibold">
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
              onClick={onExit}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-sm font-medium text-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit Demo
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-500" />
              <div>
                <p className="text-xs text-gray-500">You</p>
                <p className="font-medium text-gray-800">2:30 PM</p>
              </div>
            </div>
            <div className="w-px h-8 bg-pink-200"></div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              <div>
                <p className="text-xs text-gray-500">Alex</p>
                <p className="font-medium text-gray-800">11:30 AM</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'chat' && renderChat()}
        {activeTab === 'mood' && renderMood()}
        {activeTab === 'memories' && renderMemories()}
        {activeTab === 'prompts' && renderPrompts()}
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
